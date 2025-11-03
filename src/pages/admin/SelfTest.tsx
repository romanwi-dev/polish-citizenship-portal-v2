import React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { isIOSSafari, openPdfUrl, downloadBase64Pdf, copyToClipboard, short } from '@/lib/selftest-utils';

type LogItem = { t: string; level: 'info' | 'ok' | 'warn' | 'err'; msg: string };
function now() {
  return new Date().toLocaleTimeString();
}

function Badge({ kind, children }: { kind: 'ok' | 'err' | 'warn' | 'info'; children: React.ReactNode }) {
  const map: any = {
    ok: 'bg-green-100 text-green-800 border-green-300',
    err: 'bg-red-100 text-red-800 border-red-300',
    warn: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    info: 'bg-blue-100 text-blue-800 border-blue-300',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded border text-xs font-medium ${map[kind]}`}>
      {children}
    </span>
  );
}

export default function SelfTest() {
  const [logs, setLogs] = React.useState<LogItem[]>([]);
  const [status, setStatus] = React.useState<Record<string, 'idle' | 'ok' | 'err'>>({
    health: 'idle',
    storage: 'idle',
    pdfJson: 'idle',
    pdfBin: 'idle',
    fill: 'idle',
    refresh: 'idle',
  });
  const [adminToken, setAdminToken] = React.useState('');
  const [caseId, setCaseId] = React.useState('');
  const [templateType, setTemplateType] = React.useState<
    'citizenship' | 'family-tree' | 'registration' | 'transcription' | 'poa-adult' | 'poa-minor' | 'poa-spouses'
  >('citizenship');

  const push = (level: LogItem['level'], msg: string) => setLogs((l) => [...l, { t: now(), level, msg }]);

  const setS = (key: string, val: 'ok' | 'err') => setStatus((s) => ({ ...s, [key]: val }));

  async function testHealth() {
    push('info', 'Calling function: health (POST via invoke)…');
    try {
      const { data, error } = await supabase.functions.invoke('health', { body: {} });
      if (error) throw error;
      push('ok', `health: ${short(data)}`);
      setS('health', 'ok');
    } catch (e: any) {
      push('err', `health failed: ${e?.message ?? e}`);
      setS('health', 'err');
    }
  }

  async function testStorage() {
    push('info', 'Calling function: storage-test…');
    try {
      const { data, error } = await supabase.functions.invoke('storage-test', { body: {} });
      if (error) throw error;
      if (data?.ok && data?.url) {
        push('ok', `storage-test: signed URL received`);
        openPdfUrl(data.url); // will download/open selftest.txt
        setS('storage', 'ok');
      } else {
        throw new Error('no url in response');
      }
    } catch (e: any) {
      push('err', `storage-test failed: ${e?.message ?? e}`);
      setS('storage', 'err');
    }
  }

  async function testPdfJson() {
    push('info', 'Calling function: pdf-minimal (JSON/base64)…');
    try {
      const { data, error } = await supabase.functions.invoke('pdf-minimal', { body: {} });
      if (error) throw error;
      if (data?.ok && data?.pdf) {
        downloadBase64Pdf(data.pdf, 'hello.pdf');
        push('ok', 'pdf-minimal JSON: opened base64 PDF');
        setS('pdfJson', 'ok');
      } else {
        throw new Error('no base64 pdf in response');
      }
    } catch (e: any) {
      push('err', `pdf-minimal JSON failed: ${e?.message ?? e}`);
      setS('pdfJson', 'err');
    }
  }

  async function testPdfBinary() {
    push('info', 'Calling function: pdf-minimal (binary)…');
    try {
      const projectUrl = import.meta.env.VITE_SUPABASE_URL;
      const url = `${projectUrl}/functions/v1/pdf-minimal?mode=binary`;
      const res = await fetch(url, { method: 'POST' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      openPdfUrl(objectUrl);
      setTimeout(() => URL.revokeObjectURL(objectUrl), 30000);
      push('ok', `pdf-minimal binary: opened PDF (${res.headers.get('content-type')})`);
      setS('pdfBin', 'ok');
    } catch (e: any) {
      push('err', `pdf-minimal binary failed: ${e?.message ?? e}`);
      setS('pdfBin', 'err');
    }
  }

  async function testFillPdf() {
    if (!caseId) {
      push('warn', 'Provide a caseId to test fill-pdf');
      return;
    }
    push('info', `Calling function: fill-pdf (caseId=${caseId}, templateType=${templateType})…`);
    try {
      const { data, error } = await supabase.functions.invoke('fill-pdf', { body: { caseId, templateType } });
      if (error) throw error;
      if (data?.url) {
        openPdfUrl(data.url);
        push('ok', 'fill-pdf: got signed URL and opened');
        setS('fill', 'ok');
      } else if (data?.pdf) {
        downloadBase64Pdf(data.pdf);
        push('ok', 'fill-pdf: opened base64 PDF');
        setS('fill', 'ok');
      } else {
        throw new Error('no url/pdf in response');
      }
    } catch (e: any) {
      push('err', `fill-pdf failed: ${e?.message ?? e}`);
      setS('fill', 'err');
    }
  }

  async function testRefresh() {
    if (!caseId) {
      push('warn', 'Provide a caseId to test pdf-refresh');
      return;
    }
    push('info', `Calling function: pdf-refresh (caseId=${caseId}, templateType=${templateType})…`);
    try {
      const { data, error } = await supabase.functions.invoke('pdf-refresh', { body: { caseId, templateType } });
      if (error) throw error;
      if (data?.url) {
        openPdfUrl(data.url);
        push('ok', 'pdf-refresh: got new signed URL and opened');
        setS('refresh', 'ok');
      } else {
        throw new Error('no url in response');
      }
    } catch (e: any) {
      push('err', `pdf-refresh failed: ${e?.message ?? e}`);
      setS('refresh', 'err');
    }
  }

  const edgeBase = import.meta.env.VITE_SUPABASE_URL + '/functions/v1';

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-40 bg-background/90 backdrop-blur border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-2">
          <h1 className="text-lg font-semibold">Self-Test: Edge Functions & PDF</h1>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => {
                setLogs([]);
              }}
              className="px-3 py-1.5 rounded border text-sm hover:bg-accent"
            >
              Clear Log
            </button>
            <button
              onClick={() => {
                testHealth();
                testStorage();
                testPdfJson();
                testPdfBinary();
              }}
              className="px-3 py-1.5 rounded bg-primary text-primary-foreground text-sm hover:bg-primary/90"
            >
              Run Core Tests
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Config */}
        <div className="p-4 rounded-2xl border">
          <h2 className="font-medium mb-3">Config</h2>
          <label className="block text-sm mb-1">Admin token (optional, for diagnostics endpoints)</label>
          <input
            value={adminToken}
            onChange={(e) => setAdminToken(e.target.value)}
            className="w-full border rounded px-3 py-2 mb-3 bg-background"
            placeholder="x-admin-token (optional)"
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm mb-1">caseId</label>
              <input
                value={caseId}
                onChange={(e) => setCaseId(e.target.value)}
                className="w-full border rounded px-3 py-2 bg-background"
                placeholder="e.g. CASE123"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">templateType</label>
              <select
                value={templateType}
                onChange={(e) => setTemplateType(e.target.value as any)}
                className="w-full border rounded px-3 py-2 bg-background"
              >
                <option>citizenship</option>
                <option>family-tree</option>
                <option>registration</option>
                <option>transcription</option>
                <option>poa-adult</option>
                <option>poa-minor</option>
                <option>poa-spouses</option>
              </select>
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <button onClick={testFillPdf} className="px-3 py-1.5 rounded border text-sm hover:bg-accent">
              Test fill-pdf
            </button>
            <button onClick={testRefresh} className="px-3 py-1.5 rounded border text-sm hover:bg-accent">
              Test pdf-refresh
            </button>
          </div>
        </div>

        {/* Status */}
        <div className="p-4 rounded-2xl border">
          <h2 className="font-medium mb-3">Status</h2>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span>health</span>
              <Badge kind={status.health === 'ok' ? 'ok' : status.health === 'err' ? 'err' : 'info'}>
                {status.health === 'ok' ? 'OK' : status.health === 'err' ? 'ERROR' : 'IDLE'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>storage-test</span>
              <Badge kind={status.storage === 'ok' ? 'ok' : status.storage === 'err' ? 'err' : 'info'}>
                {status.storage === 'ok' ? 'OK' : status.storage === 'err' ? 'ERROR' : 'IDLE'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>pdf-minimal (JSON)</span>
              <Badge kind={status.pdfJson === 'ok' ? 'ok' : status.pdfJson === 'err' ? 'err' : 'info'}>
                {status.pdfJson === 'ok' ? 'OK' : status.pdfJson === 'err' ? 'ERROR' : 'IDLE'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>pdf-minimal (binary)</span>
              <Badge kind={status.pdfBin === 'ok' ? 'ok' : status.pdfBin === 'err' ? 'err' : 'info'}>
                {status.pdfBin === 'ok' ? 'OK' : status.pdfBin === 'err' ? 'ERROR' : 'IDLE'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>fill-pdf (optional)</span>
              <Badge kind={status.fill === 'ok' ? 'ok' : status.fill === 'err' ? 'err' : 'info'}>
                {status.fill === 'ok' ? 'OK' : status.fill === 'err' ? 'ERROR' : 'IDLE'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>pdf-refresh (optional)</span>
              <Badge kind={status.refresh === 'ok' ? 'ok' : status.refresh === 'err' ? 'err' : 'info'}>
                {status.refresh === 'ok' ? 'OK' : status.refresh === 'err' ? 'ERROR' : 'IDLE'}
              </Badge>
            </div>
          </div>
        </div>

        {/* cURL helpers */}
        <div className="p-4 rounded-2xl border">
          <h2 className="font-medium mb-3">cURL (copy & run)</h2>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between gap-2">
              <code className="truncate flex-1 text-xs">curl -i -X POST "{edgeBase}/health"</code>
              <button
                onClick={() => copyToClipboard(`curl -i -X POST "${edgeBase}/health"`)}
                className="px-2 py-1 border rounded hover:bg-accent"
              >
                Copy
              </button>
            </div>
            <div className="flex items-center justify-between gap-2">
              <code className="truncate flex-1 text-xs">curl -i -X POST "{edgeBase}/storage-test"</code>
              <button
                onClick={() => copyToClipboard(`curl -i -X POST "${edgeBase}/storage-test"`)}
                className="px-2 py-1 border rounded hover:bg-accent"
              >
                Copy
              </button>
            </div>
            <div className="flex items-center justify-between gap-2">
              <code className="truncate flex-1 text-xs">curl -i -X POST "{edgeBase}/pdf-minimal"</code>
              <button
                onClick={() => copyToClipboard(`curl -i -X POST "${edgeBase}/pdf-minimal"`)}
                className="px-2 py-1 border rounded hover:bg-accent"
              >
                Copy
              </button>
            </div>
            <div className="flex items-center justify-between gap-2">
              <code className="truncate flex-1 text-xs">
                curl -i -X POST "{edgeBase}/pdf-minimal?mode=binary"
              </code>
              <button
                onClick={() =>
                  copyToClipboard(
                    `curl -i -X POST "${edgeBase}/pdf-minimal?mode=binary" -H "Accept: application/pdf"`
                  )
                }
                className="px-2 py-1 border rounded hover:bg-accent"
              >
                Copy
              </button>
            </div>
          </div>
        </div>

        {/* Log viewer */}
        <div className="p-4 rounded-2xl border md:col-span-2">
          <h2 className="font-medium mb-3">Log</h2>
          <div className="h-56 overflow-auto bg-muted rounded-xl border px-3 py-2 text-sm">
            {logs.length === 0 && <div className="text-muted-foreground">No messages yet.</div>}
            {logs.map((l, i) => (
              <div key={i} className="whitespace-pre-wrap">
                <span className="text-muted-foreground">{l.t}</span>{' '}
                <strong
                  className={{
                    info: 'text-blue-700',
                    ok: 'text-green-700',
                    warn: 'text-yellow-700',
                    err: 'text-red-700',
                  }[l.level]}
                >
                  {l.level.toUpperCase()}
                </strong>{' '}
                <span>{l.msg}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
