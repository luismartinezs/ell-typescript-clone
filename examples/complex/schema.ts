// TODO make it work
import * as  ell from '@/ell'
import { Message } from '@/types';
import { z } from 'zod';

ell.init({})

const PersonInfo = z.object({
  name: z.string().describe("The name of the person"),
  age: z.number().describe("The age of the person")
});

type PersonInfo = z.infer<typeof PersonInfo>;


const extractPersonInfo = ell.complex({
  model: "gpt-4o-mini",
  responseFormat: PersonInfo
},
  async (text: string): Promise<Message[]> => {
    return [
      ell.system("Extract person information from the given text."),
      ell.user(text)
    ];
  }
);

(async () => {
  const text = "John Doe is a 30-year-old software engineer.";
  const result = await extractPersonInfo(text);
  const personInfo = result.parsed;

  console.log(`Name: ${personInfo.name}, Age: ${personInfo.age}`);
})();