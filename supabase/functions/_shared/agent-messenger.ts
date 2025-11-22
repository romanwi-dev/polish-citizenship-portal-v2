/**
 * Agent-to-Agent Communication System
 * Enables agents to share insights, coordinate actions, and trigger workflows
 */

export interface AgentMessage {
  id?: string;
  from_agent: string;
  to_agent: string | 'broadcast';
  message_type: 'insight' | 'request' | 'response' | 'alert' | 'trigger' | 'coordination';
  priority: 'low' | 'medium' | 'high' | 'critical';
  subject: string;
  body: any;
  metadata?: {
    case_id?: string;
    document_id?: string;
    workflow_id?: string;
    reply_to?: string;
    correlation_id?: string;
    expires_at?: string;
    [key: string]: any;
  };
  status?: 'pending' | 'delivered' | 'processed' | 'failed';
  created_at?: string;
  processed_at?: string;
}

export interface WorkflowTrigger {
  trigger_agent: string;
  target_workflow: string;
  case_id?: string;
  action: string;
  parameters: any;
  priority: 'low' | 'medium' | 'high' | 'critical';
  reason: string;
}

export class AgentMessenger {
  constructor(private supabase: any, private agentName: string) {}

  /**
   * Send a message to another agent or broadcast to all
   */
  async sendMessage(message: Omit<AgentMessage, 'from_agent'>): Promise<{ success: boolean; message_id?: string; error?: string }> {
    try {
      const fullMessage: AgentMessage = {
        ...message,
        from_agent: this.agentName,
        status: 'pending',
        created_at: new Date().toISOString(),
      };

      // Store message in agent_memory as a message queue entry
      const { data, error } = await this.supabase
        .from('agent_memory')
        .insert({
          agent_type: 'agent_messenger',
          memory_key: `msg_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          data: fullMessage,
        })
        .select()
        .single();

      if (error) {
        console.error('[AgentMessenger] Failed to send message:', error);
        return { success: false, error: error.message };
      }

      console.log(`[AgentMessenger] Message sent from ${this.agentName} to ${message.to_agent}`);
      return { success: true, message_id: data.id };
    } catch (error) {
      console.error('[AgentMessenger] Error sending message:', error);
      return { success: false, error: String(error) };
    }
  }

  /**
   * Receive messages addressed to this agent
   */
  async receiveMessages(options?: {
    priority?: AgentMessage['priority'][];
    message_type?: AgentMessage['message_type'][];
    unprocessed_only?: boolean;
    limit?: number;
  }): Promise<AgentMessage[]> {
    try {
      const { data: messages, error } = await this.supabase
        .from('agent_memory')
        .select('*')
        .eq('agent_type', 'agent_messenger')
        .order('created_at', { ascending: false })
        .limit(options?.limit || 50);

      if (error) {
        console.error('[AgentMessenger] Failed to receive messages:', error);
        return [];
      }

      // Filter messages for this agent
      let filtered = messages
        .map((m: any) => m.data as AgentMessage)
        .filter((msg: AgentMessage) => 
          msg.to_agent === this.agentName || msg.to_agent === 'broadcast'
        );

      // Apply filters
      if (options?.priority && options.priority.length > 0) {
        filtered = filtered.filter((msg: AgentMessage) => options.priority!.includes(msg.priority));
      }

      if (options?.message_type && options.message_type.length > 0) {
        filtered = filtered.filter((msg: AgentMessage) => options.message_type!.includes(msg.message_type));
      }

      if (options?.unprocessed_only) {
        filtered = filtered.filter((msg: AgentMessage) => msg.status === 'pending');
      }

      // Sort by priority (critical > high > medium > low)
      const priorityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
      filtered.sort((a: AgentMessage, b: AgentMessage) => priorityOrder[a.priority] - priorityOrder[b.priority]);

      return filtered;
    } catch (error) {
      console.error('[AgentMessenger] Error receiving messages:', error);
      return [];
    }
  }

  /**
   * Mark a message as processed
   */
  async markProcessed(messageId: string): Promise<void> {
    try {
      const { data: messages } = await this.supabase
        .from('agent_memory')
        .select('*')
        .eq('agent_type', 'agent_messenger');

      const message = messages?.find((m: any) => m.data?.id === messageId || m.id === messageId);
      
      if (message) {
        const updatedData = {
          ...message.data,
          status: 'processed',
          processed_at: new Date().toISOString(),
        };

        await this.supabase
          .from('agent_memory')
          .update({ data: updatedData })
          .eq('id', message.id);

        console.log(`[AgentMessenger] Message ${messageId} marked as processed`);
      }
    } catch (error) {
      console.error('[AgentMessenger] Error marking message as processed:', error);
    }
  }

  /**
   * Send an insight to other agents
   */
  async shareInsight(params: {
    to_agent: string | 'broadcast';
    insight_type: string;
    insight_data: any;
    priority?: AgentMessage['priority'];
    case_id?: string;
  }): Promise<{ success: boolean; message_id?: string }> {
    return this.sendMessage({
      to_agent: params.to_agent,
      message_type: 'insight',
      priority: params.priority || 'medium',
      subject: `Insight: ${params.insight_type}`,
      body: params.insight_data,
      metadata: {
        case_id: params.case_id,
        insight_type: params.insight_type,
      },
    });
  }

  /**
   * Request assistance from another agent
   */
  async requestAssistance(params: {
    to_agent: string;
    request_type: string;
    request_data: any;
    priority?: AgentMessage['priority'];
    case_id?: string;
  }): Promise<{ success: boolean; message_id?: string }> {
    return this.sendMessage({
      to_agent: params.to_agent,
      message_type: 'request',
      priority: params.priority || 'high',
      subject: `Assistance Request: ${params.request_type}`,
      body: params.request_data,
      metadata: {
        case_id: params.case_id,
        request_type: params.request_type,
        correlation_id: `req_${Date.now()}`,
      },
    });
  }

  /**
   * Send a response to a previous request
   */
  async sendResponse(params: {
    to_agent: string;
    reply_to_message_id: string;
    response_data: any;
    success: boolean;
  }): Promise<{ success: boolean; message_id?: string }> {
    return this.sendMessage({
      to_agent: params.to_agent,
      message_type: 'response',
      priority: 'high',
      subject: 'Response to your request',
      body: {
        success: params.success,
        data: params.response_data,
      },
      metadata: {
        reply_to: params.reply_to_message_id,
      },
    });
  }

  /**
   * Broadcast an alert to all agents
   */
  async broadcastAlert(params: {
    alert_type: string;
    alert_data: any;
    priority?: 'high' | 'critical';
    case_id?: string;
  }): Promise<{ success: boolean; message_id?: string }> {
    return this.sendMessage({
      to_agent: 'broadcast',
      message_type: 'alert',
      priority: params.priority || 'high',
      subject: `Alert: ${params.alert_type}`,
      body: params.alert_data,
      metadata: {
        case_id: params.case_id,
        alert_type: params.alert_type,
      },
    });
  }

  /**
   * Trigger a workflow on another agent
   */
  async triggerWorkflow(trigger: WorkflowTrigger): Promise<{ success: boolean; message_id?: string }> {
    return this.sendMessage({
      to_agent: trigger.target_workflow,
      message_type: 'trigger',
      priority: trigger.priority,
      subject: `Workflow Trigger: ${trigger.action}`,
      body: {
        action: trigger.action,
        parameters: trigger.parameters,
        reason: trigger.reason,
      },
      metadata: {
        case_id: trigger.case_id,
        trigger_agent: trigger.trigger_agent,
        workflow_action: trigger.action,
      },
    });
  }

  /**
   * Coordinate an action with multiple agents
   */
  async coordinateAction(params: {
    agents: string[];
    coordination_type: string;
    action_plan: any;
    priority?: AgentMessage['priority'];
    case_id?: string;
  }): Promise<{ success: boolean; message_ids: string[] }> {
    const correlationId = `coord_${Date.now()}`;
    const messageIds: string[] = [];

    for (const agent of params.agents) {
      const result = await this.sendMessage({
        to_agent: agent,
        message_type: 'coordination',
        priority: params.priority || 'medium',
        subject: `Coordination: ${params.coordination_type}`,
        body: params.action_plan,
        metadata: {
          case_id: params.case_id,
          coordination_type: params.coordination_type,
          correlation_id: correlationId,
          participating_agents: params.agents,
        },
      });

      if (result.success && result.message_id) {
        messageIds.push(result.message_id);
      }
    }

    return {
      success: messageIds.length > 0,
      message_ids: messageIds,
    };
  }

  /**
   * Clean up old processed messages
   */
  async cleanupOldMessages(olderThanDays: number = 7): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

      const { data: messages } = await this.supabase
        .from('agent_memory')
        .select('*')
        .eq('agent_type', 'agent_messenger')
        .lt('created_at', cutoffDate.toISOString());

      if (!messages || messages.length === 0) {
        return 0;
      }

      // Only delete processed messages
      const processedMessages = messages.filter((m: any) => 
        m.data?.status === 'processed' || m.data?.status === 'failed'
      );

      if (processedMessages.length > 0) {
        const idsToDelete = processedMessages.map((m: any) => m.id);
        
        await this.supabase
          .from('agent_memory')
          .delete()
          .in('id', idsToDelete);

        console.log(`[AgentMessenger] Cleaned up ${processedMessages.length} old messages`);
        return processedMessages.length;
      }

      return 0;
    } catch (error) {
      console.error('[AgentMessenger] Error cleaning up messages:', error);
      return 0;
    }
  }
}

/**
 * Create a messenger instance for an agent
 */
export function createMessenger(supabase: any, agentName: string): AgentMessenger {
  return new AgentMessenger(supabase, agentName);
}
