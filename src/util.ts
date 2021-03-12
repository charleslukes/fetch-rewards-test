export const responseStructure = (
  code: number,
  data: Array<any> | null,
  message: string
) => {
  return {
    code,
    data,
    message,
  };
};
