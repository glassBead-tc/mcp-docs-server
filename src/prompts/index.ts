/**
 * MCP Development Prompts
 * Interactive workflows and guides for MCP development
 */

import { quickStartGuide } from "./quickStartGuide.js";
import { serverDevelopmentWorkflow } from "./serverDevelopmentWorkflow.js";
import { clientIntegrationGuide } from "./clientIntegrationGuide.js";
import { troubleshootingWorkflow } from "./troubleshootingWorkflow.js";
import { deploymentGuide } from "./deploymentGuide.js";

export const prompts = {
  "mcp_quick_start": {
    name: "mcp_quick_start", 
    description: "Get started quickly with MCP development - from setup to first working server",
    handler: quickStartGuide
  },
  
  "server_development_workflow": {
    name: "server_development_workflow",
    description: "Complete workflow for developing, testing, and deploying MCP servers",
    arguments: [
      {
        name: "server_type",
        description: "Type of server to build (tool, resource, prompt, or mixed)",
        required: false
      },
      {
        name: "language",
        description: "Programming language (python, typescript, java, etc.)",
        required: false
      }
    ],
    handler: serverDevelopmentWorkflow
  },
  
  "client_integration_guide": {
    name: "client_integration_guide", 
    description: "Guide for integrating MCP servers into AI applications and clients",
    arguments: [
      {
        name: "client_type",
        description: "Type of client application (desktop, web, mobile, cli)",
        required: false
      }
    ],
    handler: clientIntegrationGuide
  },
  
  "troubleshooting_workflow": {
    name: "troubleshooting_workflow",
    description: "Systematic troubleshooting guide for MCP connection and execution issues",
    arguments: [
      {
        name: "issue_type",
        description: "Type of issue (connection, tools, resources, performance)",
        required: false
      }
    ],
    handler: troubleshootingWorkflow
  },
  
  "deployment_guide": {
    name: "deployment_guide",
    description: "Best practices and workflows for deploying MCP servers in production",
    arguments: [
      {
        name: "deployment_target",
        description: "Deployment target (local, cloud, container, edge)",
        required: false
      }
    ],
    handler: deploymentGuide
  }
};