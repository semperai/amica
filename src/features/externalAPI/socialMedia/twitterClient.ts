import { config } from '@/utils/config';
import { TwitterApi, TwitterApiReadWrite, TwitterApiReadOnly, TweetV2PostTweetResult } from 'twitter-api-v2';

class TwitterClient {
  private twitterClient!: TwitterApiReadWrite;
  private twitterBearer!: TwitterApiReadOnly;
  private initialized = false;

  private initialize() {
    if (this.initialized) return;

    const appKey = config('x_api_key');
    const appSecret = config('x_api_secret');
    const accessToken = config('x_access_token');
    const accessSecret = config('x_access_secret');
    const bearerToken = config('x_bearer_token');

    const keys = { appKey, appSecret, accessToken, accessSecret, bearerToken };
    const missing = Object.entries(keys).filter(([key, value]) => !value || value.trim() === '');

    if (missing.length > 0) {
      throw new Error(`Missing or empty Twitter API config: ${missing}`);
    }

    const client = new TwitterApi({
      appKey,
      appSecret,
      accessToken,
      accessSecret,
    });

    const bearer = new TwitterApi(bearerToken);

    this.twitterClient = client.readWrite;
    this.twitterBearer = bearer.readOnly;
    this.initialized = true;
  }

  public getReadWriteClient(): TwitterApiReadWrite {
    this.initialize();
    return this.twitterClient;
  }

  public getReadOnlyClient(): TwitterApiReadOnly {
    this.initialize();
    return this.twitterBearer;
  }

  public async postTweet(content: string): Promise<TweetV2PostTweetResult | string> {
    try {
      this.initialize();
      const response = await this.twitterClient.v2.tweet(content);
      return response;
    } catch (error: any) {
      return error;
    }
  }
}

let instance: TwitterClient | null = null;

export function getTwitterClient(): TwitterClient {
  if (!instance) {
    instance = new TwitterClient();
  }
  return instance;
}
