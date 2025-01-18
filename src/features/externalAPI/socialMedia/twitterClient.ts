import { config } from '@/utils/config';
import { TwitterApi, TwitterApiReadWrite, TwitterApiReadOnly, TweetV2PostTweetResult } from 'twitter-api-v2';

class TwitterClient {
  private twitterClient: TwitterApiReadWrite;
  private twitterBearer: TwitterApiReadOnly;

  constructor() {
    const appKey = config("x_api_key");
    const appSecret = config("x_access_secret");
    const accessToken = config("x_access_token");
    const accessSecret = config("x_access_secret");
    const bearerToken = config("x_bearer_token");

    // Initialize the Twitter API client with access tokens
    const client = new TwitterApi({
      appKey,
      appSecret,
      accessToken,
      accessSecret,
    });

    // Initialize the bearer token client for read-only access
    const bearer = new TwitterApi(bearerToken);

    // Define specific access modes for clients
    this.twitterClient = client.readWrite;
    this.twitterBearer = bearer.readOnly;
  }

  // Method to get the read-write client
  public getReadWriteClient(): TwitterApiReadWrite {
    return this.twitterClient;
  }

  // Method to get the read-only client
  public getReadOnlyClient(): TwitterApiReadOnly {
    return this.twitterBearer;
  }

  // Function to post a tweet
  public async postTweet(content: string): Promise<TweetV2PostTweetResult | undefined> {
    try {
      const response = await this.twitterClient.v2.tweet(content);
      return response;
    } catch (error) {
      console.error('Error posting tweet:', error);
      return;
    }
  }
}

// Export an instance of the TwitterClient class for use
export const twitterClientInstance = new TwitterClient();
export const twitterReadWriteClient = twitterClientInstance.getReadWriteClient();
export const twitterReadOnlyClient = twitterClientInstance.getReadOnlyClient();
