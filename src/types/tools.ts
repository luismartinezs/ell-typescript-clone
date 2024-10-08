import { z } from 'zod'

type AnyZodSchema = z.ZodType<any>
type ToolArgs<Name, Input, Output> = {
  name: Name
  input: Input
  output: Output
  description: string
}
export type ToolFunction<Input, Output> = (args: Input) => Promise<Output>
export type Tool<Input, Output> = ToolFunction<Input, Output> & {
  __ell_tool_input__: z.ZodType<Input>
  __ell_tool_output__: z.ZodType<Output>
  __ell_tool_name__: string
  __ell_tool_description__: string
  __ell_is_tool__: true
}

export const tool = <
  const Name extends string,
  Input extends AnyZodSchema,
  Output extends AnyZodSchema,
  Args extends ToolArgs<Name, Input, Output>,
>(args: Args, f: ToolFunction<z.infer<Input>, z.infer<Output>>) => {
  // console.log('args', args);
  // console.log('f', f);

  // if (args instanceof z.ZodFunction) {
  //   return toolFromZodFunction(args, f)
  // }

  Object.assign(f, {
    __ell_tool_input__: args.input,
    __ell_tool_output__: args.output,
    __ell_tool_name__: args.name,
    __ell_tool_description__: args.description,
    __ell_is_tool__: true,
  })
  return f
}

export const toolFromZodFunction = <Args extends z.ZodTuple, Output extends z.ZodObject<any>>(
  zf: z.ZodFunction<Args, Output>,
  f: (...args: z.infer<Args>) => Promise<z.infer<Output>>
) => {
  let fncName = f.name
  if (!fncName) {
    fncName = 'anonymous'
  }

  Object.assign(f, {
    __ell_tool_input__: zf._input,
    __ell_tool_output__: zf._output,
    __ell_tool_name__: fncName,
    __ell_tool_description__: zf._def.description,
    __ell_is_tool__: true,
  })
  return f
}
