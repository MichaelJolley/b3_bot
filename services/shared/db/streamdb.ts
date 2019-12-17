import mongoose from 'mongoose';

import { config, log } from '../common';
import {
  IStream,
  StreamModel,
  IVote,
  ICandleVote,
  ISubscriber,
  IGitHubRepo,
  ICheer,
  IRaider,
  IUserInfo,
  IStreamSegment,
  IStreamGoal,
  IStreamNote,
  IChatMessage
} from '../models';

export class StreamDb {
  constructor() {
    this.connect();
  }

  public getStream = async (
    streamDate: string
  ): Promise<IStream | undefined> => {
    return await new Promise((resolve: any) =>
      StreamModel.findOne({ streamDate: streamDate })
        .populate('candle')
        .populate('candleVotes.user')
        .populate('candleVotes.candle')
        .populate('notes.user')
        .populate('followers')
        .populate('subscribers.user')
        .populate('raiders.user')
        .populate('cheers.user')
        .populate('segments.user')
        .populate('contributors')
        .populate('githubRepos')
        .populate('moderators')
        .populate('chatMessages.user')
        .exec((err: any, res: any) => {
          if (err) {
            log('info', `ERROR: getStream ${JSON.stringify(err)}`);
            resolve(undefined);
          }
          log('info', `getStream: ${streamDate}`);
          resolve(res);
        })
    );
  };

  public saveStream = async (stream: any): Promise<boolean> => {
    return await new Promise((resolve: any) =>
      StreamModel.findOneAndUpdate(
        { streamDate: stream.streamDate },
        stream,
        { upsert: true },
        (err: any, res: any) => {
          if (err) {
            log('info', `ERROR: saveStream ${JSON.stringify(err)}`);
            resolve(false);
          }
          log('info', `saveStream: ${stream.streamDate}`);
          resolve(true);
        }
      )
    );
  };

  public recordSubscriber = async (
    streamDate: string,
    subscriber: ISubscriber
  ): Promise<boolean> => {
    log('info', `recordSubscriber: ${subscriber.user.login}`);

    const stream = await this.getStream(streamDate);

    if (
      stream &&
      (stream.subscribers == null ||
        stream.subscribers.find(
          (f: ISubscriber) => f.user._id === subscriber.user._id
        ) === undefined)
    ) {
      // record subscriber
      return await new Promise((resolve: any) =>
        StreamModel.updateOne(
          { streamDate: streamDate },
          {
            $push: {
              subscribers: {
                user: subscriber.user._id,
                wasGift: subscriber.wasGift,
                cumulativeMonths: subscriber.cumulativeMonths
              }
            }
          },
          (err: any, res: any) => {
            if (err) {
              log('info', `ERROR: recordSubscriber ${JSON.stringify(err)}`);
              resolve(false);
            }
            resolve(true);
          }
        )
      );
    }
    return false;
  };

  public recordRepo = async (
    streamDate: string,
    githubRepo: IGitHubRepo
  ): Promise<boolean> => {
    log('info', `recordRepo: ${githubRepo.full_name}`);

    const stream = await this.getStream(streamDate);

    if (
      stream &&
      (stream.githubRepos == null ||
        stream.githubRepos.find((f: IGitHubRepo) => f.id === githubRepo.id) ===
          undefined)
    ) {
      // record subscriber
      return await new Promise((resolve: any) =>
        StreamModel.updateOne(
          { streamDate: streamDate },
          {
            $push: {
              githubRepos: githubRepo._id
            }
          },
          (err: any, res: any) => {
            if (err) {
              log('info', `ERROR: recordRepo ${JSON.stringify(err)}`);
              resolve(false);
            }
            resolve(true);
          }
        )
      );
    }
    return false;
  };

  public recordSegment = async (
    streamDate: string,
    segment: IStreamSegment
  ): Promise<boolean> => {
    log('info', `recordSegment: ${segment.user.login}: ${segment.topic}`);

    // record segment
    return await new Promise((resolve: any) =>
      StreamModel.updateOne(
        { streamDate: streamDate },
        {
          $push: {
            segments: {
              user: segment.user._id,
              timestamp: segment.timestamp,
              topic: segment.topic
            }
          }
        },
        (err: any, res: any) => {
          if (err) {
            log('info', `ERROR: recordSegment ${JSON.stringify(err)}`);
            resolve(false);
          }
          resolve(true);
        }
      )
    );
  };

  public recordNewGoal = async (
    streamDate: string,
    goal: IStreamGoal
  ): Promise<boolean> => {
    log('info', `recordNewGoal: ${goal.name}`);

    // record goal
    return await new Promise((resolve: any) =>
      StreamModel.updateOne(
        { streamDate: streamDate },
        {
          $push: {
            goals: goal
          }
        },
        (err: any, res: any) => {
          if (err) {
            log('info', `ERROR: recordNewGoal ${JSON.stringify(err)}`);
            resolve(false);
          }
          resolve(true);
        }
      )
    );
  };

  public recordNote = async (
    streamDate: string,
    note: IStreamNote
  ): Promise<boolean> => {
    log('info', `recordNote: ${note.user.login}: ${note.name}`);

    // record goal
    return await new Promise((resolve: any) =>
      StreamModel.updateOne(
        { streamDate: streamDate },
        {
          $push: {
            notes: { user: note.user._id, name: note.name }
          }
        },
        (err: any, res: any) => {
          if (err) {
            log('info', `ERROR: recordNote ${JSON.stringify(err)}`);
            resolve(false);
          }
          resolve(true);
        }
      )
    );
  };

  public recordChatMessage = async (
    streamDate: string,
    chatMessage: IChatMessage
  ): Promise<boolean> => {
    log(
      'info',
      `recordChatMessage: ${chatMessage.user}: ${chatMessage.message}`
    );

    // record goal
    return await new Promise((resolve: any) =>
      StreamModel.updateOne(
        { streamDate: streamDate },
        {
          $push: {
            chatMessages: {
              user: chatMessage.user._id,
              message: chatMessage.message,
              timestamp: chatMessage.timestamp
            }
          }
        },
        (err: any, res: any) => {
          if (err) {
            log('info', `ERROR: recordChatMessage ${JSON.stringify(err)}`);
            resolve(false);
          }
          resolve(true);
        }
      )
    );
  };

  public recordUser = async (
    streamDate: string,
    type: string,
    user: IUserInfo
  ): Promise<boolean> => {
    log('info', `recordUser: (${type}) ${user.login}`);

    const stream = await this.getStream(streamDate);

    if (stream) {
      // record user
      let data: any = {};

      switch (type) {
        case 'contributors':
          if (
            stream.contributors &&
            stream.contributors.find((f: IUserInfo) => f._id == user._id) !==
              undefined
          ) {
            return true;
          }
          data = { contributors: user._id };
          break;
        case 'moderators':
          if (
            stream.moderators &&
            stream.moderators.find((f: IUserInfo) => f._id == user._id) !==
              undefined
          ) {
            return true;
          }
          data = { moderators: user._id };
          break;
        case 'followers':
          if (
            stream.followers &&
            stream.followers.find((f: IUserInfo) => f._id == user._id) !==
              undefined
          ) {
            return true;
          }
          data = { followers: user._id };
          break;
      }

      return await new Promise((resolve: any) =>
        StreamModel.updateOne(
          { streamDate: streamDate },
          {
            $push: data
          },
          (err: any, res: any) => {
            if (err) {
              log('info', `ERROR: recordUser: ${JSON.stringify(err)}`);
              resolve(false);
            }
            resolve(true);
          }
        )
      );
    }
    return false;
  };

  public recordRaid = async (
    streamDate: string,
    raider: IRaider
  ): Promise<boolean> => {
    log('info', `recordRaid: ${raider.user.login}`);

    const stream = await this.getStream(streamDate);

    if (
      stream &&
      (stream.raiders == null ||
        stream.raiders.find((f: IRaider) => f.user._id === raider.user._id) ===
          undefined)
    ) {
      // record raider
      return await new Promise((resolve: any) =>
        StreamModel.updateOne(
          { streamDate: streamDate },
          {
            $push: {
              raiders: { user: raider.user._id, viewers: raider.viewers }
            }
          },
          (err: any, res: any) => {
            if (err) {
              log('info', `ERROR: recordRaid ${JSON.stringify(err)}`);
              resolve(false);
            }
            resolve(true);
          }
        )
      );
    }
    return false;
  };

  public recordCheer = async (
    streamDate: string,
    cheerer: ICheer
  ): Promise<boolean> => {
    log('info', `recordCheer: ${cheerer.user.login}`);

    // record cheer
    return await new Promise((resolve: any) =>
      StreamModel.updateOne(
        { streamDate: streamDate },
        {
          $push: {
            cheers: { user: cheerer.user._id, bits: cheerer.bits }
          }
        },
        (err: any, res: any) => {
          if (err) {
            log('info', `ERROR: recordCheer ${JSON.stringify(err)}`);
            resolve(false);
          }
          resolve(true);
        }
      )
    );
  };

  public recordCandleVote = async (vote: IVote): Promise<boolean> => {
    log('info', `recordCandleVote: ${JSON.stringify(vote)}`);

    const stream = await this.getStream(vote.streamDate);

    if (
      stream &&
      stream.candleVotes &&
      stream.candleVotes.find((f: ICandleVote) => f.user._id == vote.user._id)
    ) {
      // modify existing vote
      return await new Promise((resolve: any) =>
        StreamModel.updateOne(
          {
            streamDate: vote.streamDate,
            candleVotes: { $elemMatch: { user: vote.user._id } }
          },
          { $set: { 'candleVotes.$.candle': vote.candle._id } },
          (err: any, res: any) => {
            if (err) {
              log(
                'info',
                `ERROR: recordCandleVote (existing) ${JSON.stringify(err)}`
              );
              resolve(false);
            }
            log('info', `recordCandleVote (existing)`);
            resolve(true);
          }
        )
      );
    } else {
      // record new vote
      return await new Promise((resolve: any) =>
        StreamModel.updateOne(
          { streamDate: vote.streamDate },
          {
            $push: {
              candleVotes: { user: vote.user._id, candle: vote.candle._id }
            }
          },
          (err: any, res: any) => {
            if (err) {
              log(
                'info',
                `ERROR: recordCandleVote (new) ${JSON.stringify(err)}`
              );
              resolve(false);
            }
            log('info', `recordCandleVote (new)`);
            resolve(true);
          }
        )
      );
    }
  };

  private connect() {
    mongoose.connect(
      config.mongoDBConnectionString,
      {
        dbName: config.mongoDBDatabase,
        pass: config.mongoDBPassword,
        useCreateIndex: true,
        useFindAndModify: false,
        useNewUrlParser: true,
        user: config.mongoDBUser
      },
      err => {
        if (err) {
          log('info', `Err: ${JSON.stringify(err)}`);
          setTimeout(() => this.connect, 2000);
        } else {
          log('info', `All good holmes`);
        }
      }
    );
  }
}
