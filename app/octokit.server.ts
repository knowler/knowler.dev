import { Octokit } from "octokit";
import { throttling } from "@octokit/plugin-throttling";

const OctokitWithThrottling = Octokit.plugin(throttling);

export const octokit = new OctokitWithThrottling({
  auth: process.env.GITHUB_TOKEN as string,
});
