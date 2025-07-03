# Tool Call Logging Implementation

## Overview

This implementation adds comprehensive logging to every tool call in the XMCP application. The logging captures:

- **Tool Name**: The name of the tool being called
- **Input**: The parameters passed to the tool
- **Output**: The result returned by the tool
- **Timestamp**: When the tool was called
- **Duration**: How long the tool took to execute
- **Error Handling**: Logs errors if the tool fails

## Implementation Details

### 1. Logging Utility (`src/utils/logger.ts`)

Created a reusable logging utility with:

- `logToolCall()`: Function to log tool call information
- `withLogging()`: Higher-order function that wraps tool functions with logging

### 2. Updated Utils Export (`src/utils/index.ts`)

Added exports for the logging utilities so they can be imported by tools.

### 3. Updated All Tool Files

Modified all 12 tool files in `src/tools/`:

- `checkout-branch.ts`
- `commit.ts`  
- `create-blocks.ts`
- `create-branch.ts`
- `delete-blocks.ts`
- `get-content-structure.ts`
- `get-current-ref.ts`
- `get-example-content-structure.ts`
- `list-branches.ts`
- `merge-branch.ts`
- `query-content.ts`
- `update-blocks.ts`

### Pattern Applied to Each Tool

1. **Import the logging utility**:
   ```typescript
   import { getMcpToken, withLogging } from "../utils";
   ```

2. **Convert export to regular function**:
   ```typescript
   // Before
   export default async function toolName({ ... }) { ... }
   
   // After  
   async function toolName({ ... }) { ... }
   ```

3. **Export wrapped function**:
   ```typescript
   export default withLogging("tool_name", toolName);
   ```

## Log Format

The logs are output to console in JSON format with this structure:

```json
{
  "type": "TOOL_CALL",
  "toolName": "query_content",
  "input": [{ "query": "...", "draft": true }],
  "output": { "content": [...] },
  "timestamp": "2024-01-15T10:30:00.000Z",
  "duration": 245
}
```

## Benefits

1. **Debugging**: Easy to trace tool executions and identify issues
2. **Performance Monitoring**: Track tool execution times
3. **Audit Trail**: Complete record of all tool calls and their results
4. **Error Tracking**: Capture and log errors with context
5. **Development**: Better understanding of tool usage patterns

## Usage

The logging is automatic and requires no additional configuration. Simply run the XMCP server and all tool calls will be logged to the console.

```bash
pnpm dev
```

Tool calls will produce log entries showing exactly what was called, with what parameters, and what was returned.