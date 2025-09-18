[Model Context Protocol home page![light logo](https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/logo/light.svg?fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=4498cb8a57d574005f3dca62bdd49c95)![dark logo](https://mintcdn.com/mcp/4ZXF1PrDkEaJvXpn/logo/dark.svg?fit=max&auto=format&n=4ZXF1PrDkEaJvXpn&q=85&s=c0687c003f8f2cbdb24772ab4c8a522c)](https://modelcontextprotocol.io/)

Search...

Ctrl K

Search...

Navigation

About MCP

Understanding MCP servers

[Documentation](https://modelcontextprotocol.io/docs/getting-started/intro) [Specification](https://modelcontextprotocol.io/specification/2025-06-18) [Community](https://modelcontextprotocol.io/community/communication) [About MCP](https://modelcontextprotocol.io/about)

On this page

- [Core Server Features](https://modelcontextprotocol.io/docs/learn/server-concepts#core-server-features)
- [Tools](https://modelcontextprotocol.io/docs/learn/server-concepts#tools)
- [How Tools Work](https://modelcontextprotocol.io/docs/learn/server-concepts#how-tools-work)
- [Example: Travel Booking](https://modelcontextprotocol.io/docs/learn/server-concepts#example%3A-travel-booking)
- [User Interaction Model](https://modelcontextprotocol.io/docs/learn/server-concepts#user-interaction-model)
- [Resources](https://modelcontextprotocol.io/docs/learn/server-concepts#resources)
- [How Resources Work](https://modelcontextprotocol.io/docs/learn/server-concepts#how-resources-work)
- [Example: Getting Travel Planning Context](https://modelcontextprotocol.io/docs/learn/server-concepts#example%3A-getting-travel-planning-context)
- [Parameter Completion](https://modelcontextprotocol.io/docs/learn/server-concepts#parameter-completion)
- [User Interaction Model](https://modelcontextprotocol.io/docs/learn/server-concepts#user-interaction-model-2)
- [Prompts](https://modelcontextprotocol.io/docs/learn/server-concepts#prompts)
- [How Prompts Work](https://modelcontextprotocol.io/docs/learn/server-concepts#how-prompts-work)
- [Example: Streamlined Workflows](https://modelcontextprotocol.io/docs/learn/server-concepts#example%3A-streamlined-workflows)
- [User Interaction Model](https://modelcontextprotocol.io/docs/learn/server-concepts#user-interaction-model-3)
- [Bringing Servers Together](https://modelcontextprotocol.io/docs/learn/server-concepts#bringing-servers-together)
- [Example: Multi-Server Travel Planning](https://modelcontextprotocol.io/docs/learn/server-concepts#example%3A-multi-server-travel-planning)
- [The Complete Flow](https://modelcontextprotocol.io/docs/learn/server-concepts#the-complete-flow)

MCP servers are programs that expose specific capabilities to AI applications through standardized protocol interfaces.Common examples include file system servers for document access, database servers for data queries, GitHub servers for code management, Slack servers for team communication, and calendar servers for scheduling.

## [​](https://modelcontextprotocol.io/docs/learn/server-concepts\#core-server-features) Core Server Features

Servers provide functionality through three building blocks:

| Feature | Explanation | Examples | Who controls it |
| --- | --- | --- | --- |
| **Tools** | Functions that your LLM can actively call, and decides when to use them based on user requests. Tools can write to databases, call external APIs, modify files, or trigger other logic. | Search flights<br>Send messages<br>Create calendar events | Model |
| **Resources** | Passive data sources that provide read-only access to information for context, such as file contents, database schemas, or API documentation. | Retrieve documents<br>Access knowledge bases<br>Read calendars | Application |
| **Prompts** | Pre-built instruction templates that tell the model to work with specific tools and resources. | Plan a vacation<br>Summarize my meetings<br>Draft an email | User |

We will use a hypothetical scenario to demonstrate the role of each of these features, and show how they can work together.

### [​](https://modelcontextprotocol.io/docs/learn/server-concepts\#tools) Tools

Tools enable AI models to perform actions. Each tool defines a specific operation with typed inputs and outputs. The model requests tool execution based on context.

#### [​](https://modelcontextprotocol.io/docs/learn/server-concepts\#how-tools-work) How Tools Work

Tools are schema-defined interfaces that LLMs can invoke. MCP uses JSON Schema for validation. Each tool performs a single operation with clearly defined inputs and outputs. Tools may require user consent prior to execution, helping to ensure users maintain control over actions taken by a model.**Protocol operations:**

| Method | Purpose | Returns |
| --- | --- | --- |
| `tools/list` | Discover available tools | Array of tool definitions with schemas |
| `tools/call` | Execute a specific tool | Tool execution result |

**Example tool definition:**

Copy

```
{
  name: "searchFlights",
  description: "Search for available flights",
  inputSchema: {
    type: "object",
    properties: {
      origin: { type: "string", description: "Departure city" },
      destination: { type: "string", description: "Arrival city" },
      date: { type: "string", format: "date", description: "Travel date" }
    },
    required: ["origin", "destination", "date"]
  }
}

```

#### [​](https://modelcontextprotocol.io/docs/learn/server-concepts\#example%3A-travel-booking) Example: Travel Booking

Tools enable AI applications to perform actions on behalf of users. In a travel planning scenario, the AI application might use several tools to help book a vacation:**Flight Search**

Copy

```
searchFlights(origin: "NYC", destination: "Barcelona", date: "2024-06-15")

```

Queries multiple airlines and returns structured flight options.**Calendar Blocking**

Copy

```
createCalendarEvent(title: "Barcelona Trip", startDate: "2024-06-15", endDate: "2024-06-22")

```

Marks the travel dates in the user’s calendar.**Email notification**

Copy

```
sendEmail(to: "team@work.com", subject: "Out of Office", body: "...")

```

Sends an automated out-of-office message to colleagues.

#### [​](https://modelcontextprotocol.io/docs/learn/server-concepts\#user-interaction-model) User Interaction Model

Tools are model-controlled, meaning AI models can discover and invoke them automatically. However, MCP emphasizes human oversight through several mechanisms.For trust and safety, applications can implement user control through various mechanisms, such as:

- Displaying available tools in the UI, enabling users to define whether a tool should be made available in specific interactions
- Approval dialogs for individual tool executions
- Permission settings for pre-approving certain safe operations
- Activity logs that show all tool executions with their results

### [​](https://modelcontextprotocol.io/docs/learn/server-concepts\#resources) Resources

Resources provide structured access to information that the AI application can retrieve and provide to models as context.

#### [​](https://modelcontextprotocol.io/docs/learn/server-concepts\#how-resources-work) How Resources Work

Resources expose data from files, APIs, databases, or any other source that an AI needs to understand context. Applications can access this information directly and decide how to use it - whether that’s selecting relevant portions, searching with embeddings, or passing it all to the model.Each resource has a unique URI (like `file:///path/to/document.md`) and declares its MIME type for appropriate content handling. They declare MIME types for appropriate content handling and support two discovery patterns:

- **Direct Resources** \- fixed URIs that point to specific data. Example: `calendar://events/2024` \- returns calendar availability for 2024
- **Resource Templates** \- dynamic URIs with parameters for flexible queries. Example:

  - `travel://activities/{city}/{category}` \- returns activities by city and category
  - `travel://activities/barcelona/museums` \- returns all museums in Barcelona

Resource Templates include metadata such as title, description, and expected MIME type, making them discoverable and self-documenting.**Protocol operations:**

| Method | Purpose | Returns |
| --- | --- | --- |
| `resources/list` | List available direct resources | Array of resource descriptors |
| `resources/templates/list` | Discover resource templates | Array of resource template definitions |
| `resources/read` | Retrieve resource contents | Resource data with metadata |
| `resources/subscribe` | Monitor resource changes | Subscription confirmation |

#### [​](https://modelcontextprotocol.io/docs/learn/server-concepts\#example%3A-getting-travel-planning-context) Example: Getting Travel Planning Context

Continuing with the travel planning example, resources provide the AI application with access to relevant information:

- **Calendar data** ( `calendar://events/2024`) \- Checks user availability
- **Travel documents** ( `file:///Documents/Travel/passport.pdf`) \- Accesses important documents
- **Previous itineraries** ( `trips://history/barcelona-2023`) \- References past trips and preferences

The AI application retrieves these resources and decides how to process them, whether selecting a subset of data using embeddings or keyword search, or passing raw data directly to the model.In this case, it provides calendar data, weather information, and travel preferences to the model, enabling it to check availability, look up weather patterns, and reference past travel preferences.**Resource Template Examples:**

Copy

```
{\n  \"uriTemplate\": \"weather://forecast/{city}/{date}\",\n  \"name\": \"weather-forecast\",\n  \"title\": \"Weather Forecast\",\n  \"description\": \"Get weather forecast for any city and date\",\n  \"mimeType\": \"application/json\"\n}\n\n{\n  \"uriTemplate\": \"travel://flights/{origin}/{destination}\",\n  \"name\": \"flight-search\",\n  \"title\": \"Flight Search\",\n  \"description\": \"Search available flights between cities\",\n  \"mimeType\": \"application/json\"\n}\n
```

These templates enable flexible queries. For weather data, users can access forecasts for any city/date combination. For flights, they can search routes between any two airports. When a user has input “NYC” as the `origin` airport and begins to input “Bar” as the `destination` airport, the system can suggest “Barcelona (BCN)” or “Barbados (BGI)”.

#### [​](https://modelcontextprotocol.io/docs/learn/server-concepts\#parameter-completion) Parameter Completion

Dynamic resources support parameter completion. For example:

- Typing “Par” as input for `weather://forecast/{city}` might suggest “Paris” or “Park City”
- Typing “JFK” for `flights://search/{airport}` might suggest “JFK - John F. Kennedy International”

The system helps discover valid values without requiring exact format knowledge.

#### [​](https://modelcontextprotocol.io/docs/learn/server-concepts\#user-interaction-model-2) User Interaction Model

Resources are application-driven, giving them flexibility in how they retrieve, process, and present available context. Common interaction patterns include:

- Tree or list views for browsing resources in familiar folder-like structures
- Search and filter interfaces for finding specific resources
- Automatic context inclusion or smart suggestions based on heuristics or AI selection
- Manual or bulk selection interfaces for including single or multiple resources

Applications are free to implement resource discovery through any interface pattern that suits their needs. The protocol doesn’t mandate specific UI patterns, allowing for resource pickers with preview capabilities, smart suggestions based on current conversation context, bulk selection for including multiple resources, or integration with existing file browsers and data explorers.

### [​](https://modelcontextprotocol.io/docs/learn/server-concepts\#prompts) Prompts

Prompts provide reusable templates. They allow MCP server authors to provide parameterized prompts for a domain, or showcase how to best use the MCP server.

#### [​](https://modelcontextprotocol.io/docs/learn/server-concepts\#how-prompts-work) How Prompts Work

Prompts are structured templates that define expected inputs and interaction patterns. They are user-controlled, requiring explicit invocation rather than automatic triggering. Prompts can be context-aware, referencing available resources and tools to create comprehensive workflows. Similar to resources, prompts support parameter completion to help users discover valid argument values.**Protocol operations:**

| Method | Purpose | Returns |
| --- | --- | --- |
| `prompts/list` | Discover available prompts | Array of prompt descriptors |
| `prompts/get` | Retrieve prompt details | Full prompt definition with arguments |

#### [​](https://modelcontextprotocol.io/docs/learn/server-concepts\#example%3A-streamlined-workflows) Example: Streamlined Workflows

Prompts provide structured templates for common tasks. In the travel planning context:**“Plan a vacation” prompt:**

Copy

```
{\n  \"name\": \"plan-vacation\",\n  \"title\": \"Plan a vacation\",\n  \"description\": \"Guide through vacation planning process\",\n  \"arguments\": [\\\n    { \"name\": \"destination\", \"type\": \"string\", \"required\": true },\\\n    { \"name\": \"duration\", \"type\": \"number\", \"description\": \"days\" },\\\n    { \"name\": \"budget\", \"type\": \"number\", \"required\": false },\\\n    { \"name\": \"interests\", \"type\": \"array\", \"items\": { \"type\": \"string\" } }\\\n  ]\n}\n
```

Rather than unstructured natural language input, the prompt system enables:

1. Selection of the “Plan a vacation” template
2. Structured input: Barcelona, 7 days, $3000, \\[“beaches”, “architecture”, “food”\\]
3. Consistent workflow execution based on the template

#### [​](https://modelcontextprotocol.io/docs/learn/server-concepts\#user-interaction-model-3) User Interaction Model

Prompts are user-controlled, requiring explicit invocation. The protocol gives implementers freedom to design interfaces that feel natural within their application. Key principles include:

- Easy discovery of available prompts
- Clear descriptions of what each prompt does
- Natural argument input with validation
- Transparent display of the prompt’s underlying template

Applications typically expose prompts through various UI patterns such as:

- Slash commands (typing ”/” to see available prompts like /plan-vacation)
- Command palettes for searchable access
- Dedicated UI buttons for frequently used prompts
- Context menus that suggest relevant prompts

## [​](https://modelcontextprotocol.io/docs/learn/server-concepts\#bringing-servers-together) Bringing Servers Together

The real power of MCP emerges when multiple servers work together, combining their specialized capabilities through a unified interface.

### [​](https://modelcontextprotocol.io/docs/learn/server-concepts\#example%3A-multi-server-travel-planning) Example: Multi-Server Travel Planning

Consider a personalized AI travel planner application, with three connected servers:

- **Travel Server** \- Handles flights, hotels, and itineraries
- **Weather Server** \- Provides climate data and forecasts
- **Calendar/Email Server** \- Manages schedules and communications

#### [​](https://modelcontextprotocol.io/docs/learn/server-concepts\#the-complete-flow) The Complete Flow

1. **User invokes a prompt with parameters:**

   ```json
   {
     "prompt": "plan-vacation",
     "arguments": {
       "destination": "Barcelona",
       "departure_date": "2024-06-15",
       "return_date": "2024-06-22",
       "budget": 3000,
       "travelers": 2
     }
   }
   ```

2. **User selects resources to include:**   - `calendar://my-calendar/June-2024` (from Calendar Server)
   - `travel://preferences/europe` (from Travel Server)
   - `travel://past-trips/Spain-2023` (from Travel Server)
3. **AI processes the request using tools:**The AI first reads all selected resources to gather context - identifying available dates from the calendar, learning preferred airlines and hotel types from travel preferences, and discovering previously enjoyed locations from past trips.Using this context, the AI then executes a series of Tools:

   - `searchFlights()` \- Queries airlines for NYC to Barcelona flights
   - `checkWeather()` \- Retrieves climate forecasts for travel dates

   The AI then uses this information to create the booking and following steps, requesting approval from the user where necessary:   - `bookHotel()` \- Finds hotels within the specified budget
   - `createCalendarEvent()` \- Adds the trip to the user’s calendar
   - `sendEmail()` \- Sends confirmation with trip details

**The result:** Through multiple MCP servers, the user researched and booked a Barcelona trip tailored to their schedule. The “Plan a Vacation” prompt guided the AI to combine Resources (calendar availability and travel history) with Tools (searching flights, booking hotels, updating calendars) across different servers—gathering context and executing the booking. A task that could’ve taken hours was completed in minutes using MCP.

Was this page helpful?

YesNo

[Architecture](https://modelcontextprotocol.io/docs/learn/architecture) [Clients](https://modelcontextprotocol.io/docs/learn/client-concepts)

Assistant

Responses are generated using AI and may contain mistakes.