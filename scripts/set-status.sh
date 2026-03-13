#!/bin/bash
# Usage: set-status.sh <agentId> <status> [currentTask]
# Example: set-status.sh main working "Building Google Calendar integration"

AGENT_ID="${1:-main}"
STATUS="${2:-idle}"
TASK="${3:-}"

curl -s -X POST "https://chatty-ant-890.convex.site/update-status" \
  -H "Content-Type: application/json" \
  -d "{\"agentId\":\"$AGENT_ID\",\"status\":\"$STATUS\",\"currentTask\":\"$TASK\"}" \
  > /dev/null
