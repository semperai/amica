import { BasicPage } from './common';
import { GitHubLink } from "@/components/githubLink";


export function CommunityPage() {
  return (
    <BasicPage
      title="Community"
      description="Join the community"
    >
      <ul role="list" className="divide-y divide-gray-100 max-w-xs">
        <li className="py-4">
          <a
            href="https://t.me/arbius_ai"
            target="_blank"
            className="rounded bg-indigo-600 px-2 py-1 text-lg font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
            Telegram
          </a>
        </li>
        <li className="py-4">
          <a
            href="https://twitter.com/arbius_ai"
            target="_blank"
            className="rounded bg-indigo-600 px-2 py-1 text-lg font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
            Twitter
          </a>
        </li>
        <li className="py-4">
          <GitHubLink />
        </li>
      </ul>
    </BasicPage>
  );
}
