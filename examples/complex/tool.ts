// TODO make it work
import * as  ell from '@/ell'
import { tool } from '@/types/tools';
import { z } from 'zod';

/**
 alt format: https://sdk.vercel.ai/docs/ai-sdk-core/tools-and-tool-calling
 const result = await generateText({
  model: yourModel,
  tools: {
    weather: tool({
      description: 'Get the weather in a location',
      parameters: z.object({
        location: z.string().describe('The location to get the weather for'),
      }),
      execute: async ({ location }) => ({
        location,
        temperature: 72 + Math.floor(Math.random() * 21) - 10,
      }),
    }),
  },
  prompt: 'What is the weather in San Francisco?',
});
 */

ell.init({})

const getWeather = tool(
  {
    input: z.object({
      location: z.string().describe('The full name of a city and country, e.g. San Francisco, CA, USA')
    }),
    output: z.string(),
    name: 'getWeather',
    description: 'Get the weather for a location',
  },
  async ({ location }) => {
    // api call here
    await new Promise(resolve => setTimeout(resolve, 500));
    return `The weather in ${location} is sunny with a temperature of 75 degrees.`;
  }
)

// console.log(getWeather.__ell_tool_input__);
// console.log(getWeather.__ell_tool_output__);
// console.log(getWeather.__ell_tool_name__);
// console.log(getWeather.__ell_tool_description__);

const travelPlanner = ell.complex({
  model: 'gpt-4o-mini',
  tools: [getWeather],
}, async (name: string) => {
  return [
    ell.system('You are a travel planner. You need to get the weather in the destination city to be able to create a plan depending on the weather.'),
    ell.user(`Say hello to ${name}`),
  ]
})

  ; (async () => {
    const plan = await travelPlanner('Paris')
    console.log(plan.toolCalls);
    console.log(plan.text);
    console.log(JSON.stringify(plan, null, 2));


    if (plan.toolCalls) {
      const toolResult = await plan.callToolsAndCollectAsMessage()
      console.log(toolResult.text);

      console.log(await toolResult.toolResults[0]); // this is ugly nonsense
    }
  })()
