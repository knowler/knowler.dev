import { Octokit } from "octokit";
import { throttling } from "@octokit/plugin-throttling";
import invariant from "tiny-invariant";

invariant(process.env.GITHUB_TOKEN, 'GITHUB_TOKEN must be set');

const OctokitWithThrottling = Octokit.plugin(throttling);

export const octokit = new OctokitWithThrottling({
  auth: process.env.GITHUB_TOKEN as string,
});
