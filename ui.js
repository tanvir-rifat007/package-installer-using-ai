import ora from "ora";

export const showSpinner = (text) => {
  const spinner = ora({
    text,
    spinner: "dots",
    color: "cyan",
  }).start();

  return {
    succeed: (text) => spinner.succeed(text),
    fail: () => spinner.fail(),
    stop: () => spinner.stop(),
  };
};
