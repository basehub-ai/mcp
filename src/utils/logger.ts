interface ToolCallLog {
  toolName: string;
  input: any;
  output: any;
  timestamp: string;
  duration?: number;
}

/**
 * Logs tool call information including name, input, and output
 */
export function logToolCall(log: ToolCallLog): void {
  const logEntry = {
    type: "TOOL_CALL",
    ...log,
  };
  
  console.log(`[TOOL_CALL] ${log.toolName}`, JSON.stringify(logEntry, null, 2));
}

/**
 * Higher-order function to wrap tool functions with logging
 */
export function withLogging<T extends any[], R>(
  toolName: string,
  toolFunction: (...args: T) => Promise<R> | R
): (...args: T) => Promise<R> {
  return async (...args: T): Promise<R> => {
    const timestamp = new Date().toISOString();
    const startTime = Date.now();
    
    // Log the input
    logToolCall({
      toolName,
      input: args,
      output: null,
      timestamp,
    });
    
    try {
      const result = await toolFunction(...args);
      const duration = Date.now() - startTime;
      
      // Log the output
      logToolCall({
        toolName,
        input: args,
        output: result,
        timestamp,
        duration,
      });
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      // Log the error
      logToolCall({
        toolName,
        input: args,
        output: { error: error instanceof Error ? error.message : String(error) },
        timestamp,
        duration,
      });
      
      throw error;
    }
  };
}