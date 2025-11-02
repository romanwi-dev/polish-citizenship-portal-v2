import { supabase } from "@/integrations/supabase/client";

export class AudioRecorder {
  private stream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private processor: ScriptProcessorNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;

  constructor(private onAudioData: (audioData: Float32Array) => void) {}

  async start() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 24000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      this.audioContext = new AudioContext({
        sampleRate: 24000,
      });
      
      this.source = this.audioContext.createMediaStreamSource(this.stream);
      this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);
      
      this.processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        this.onAudioData(new Float32Array(inputData));
      };
      
      this.source.connect(this.processor);
      this.processor.connect(this.audioContext.destination);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      throw error;
    }
  }

  stop() {
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }
    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

export class RealtimeChat {
  private pc: RTCPeerConnection | null = null;
  private dc: RTCDataChannel | null = null;
  private audioEl: HTMLAudioElement;
  private recorder: AudioRecorder | null = null;

  constructor(
    private formType: string,
    private onMessage: (message: any) => void,
    private onSpeakingChange: (speaking: boolean) => void
  ) {
    this.audioEl = document.createElement("audio");
    this.audioEl.autoplay = true;
  }

  async init() {
    try {
      // Request ephemeral token
      const { data: tokenData, error: tokenError } = await supabase.functions.invoke("realtime-token", {
        body: { formType: this.formType }
      });

      if (tokenError) throw tokenError;
      
      if (!tokenData?.client_secret?.value) {
        throw new Error("Failed to get ephemeral token");
      }

      const EPHEMERAL_KEY = tokenData.client_secret.value;

      // Create peer connection
      this.pc = new RTCPeerConnection();

      // Set up remote audio
      this.pc.ontrack = e => {
        this.audioEl.srcObject = e.streams[0];
      };

      // Add local audio track
      const ms = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.pc.addTrack(ms.getTracks()[0]);

      // Set up data channel for events
      this.dc = this.pc.createDataChannel("oai-events");
      
      this.dc.addEventListener("message", (e) => {
        const event = JSON.parse(e.data);
        
        if (event.type === 'response.audio.delta') {
          this.onSpeakingChange(true);
        } else if (event.type === 'response.audio.done') {
          this.onSpeakingChange(false);
        }
        
        this.onMessage(event);
      });

      // Create and set local description
      const offer = await this.pc.createOffer();
      await this.pc.setLocalDescription(offer);

      // Connect to OpenAI's Realtime API
      const baseUrl = "https://api.openai.com/v1/realtime";
      const model = "gpt-4o-realtime-preview-2024-12-17";
      
      const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
        method: "POST",
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${EPHEMERAL_KEY}`,
          "Content-Type": "application/sdp"
        },
      });

      if (!sdpResponse.ok) {
        throw new Error(`Failed to connect: ${sdpResponse.status}`);
      }

      const answer = {
        type: "answer" as RTCSdpType,
        sdp: await sdpResponse.text(),
      };
      
      await this.pc.setRemoteDescription(answer);

    } catch (error) {
      console.error("Error initializing chat:", error);
      throw error;
    }
  }

  disconnect() {
    this.recorder?.stop();
    this.dc?.close();
    this.pc?.close();
    this.audioEl.srcObject = null;
  }
}
