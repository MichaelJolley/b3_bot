export enum SocketIOEvents {
  /* chat related events */
  OnChatMessage = 'OnChatMessage',
  OnUserJoined = 'OnUserJoined',
  OnUserLeft = 'OnUserLeft',
  EmoteSent = 'EmoteSent',
  OnModeratorJoined = 'OnModeratorJoined',
  OnRaidStream = 'OnRaidStream',

  /* stat changes */
  FollowerCountChanged = 'FollowerCountChanged',
  ViewerCountChanged = 'ViewerCountChanged',
  LastFollowerUpdated = 'LastFollowerUpdated',
  LastSubscriberUpdated = 'LastSubscriberUpdated',

  /* stream events */
  StreamStarted = 'StreamStarted',
  StreamUpdated = 'StreamUpdated',
  StreamEnded = 'StreamEnded',

  NewFollower = 'NewFollower',
  NewSubscriber = 'NewSubscriber',
  NewRaid = 'NewRaid',
  NewCheer = 'NewCheer',
  NewAnnouncement = 'NewAnnouncement',

  StreamRepoChanged = 'StreamRepoChanged',

  CreditsRoll = 'CreditsRoll',
  OnCreditsRoll = 'OnCreditsRoll',
  StreamNoteRebuild = 'StreamNoteRebuild',

  /* A/V events */
  PlayAudio = 'PlayAudio',
  StopAudio = 'StopAudio',

  /* data events */
  NewNote = 'NewNote',
  NewGoal = 'NewGoal',
  GoalUpdated = 'GoalUpdated',
  NewSegment = 'NewSegment',
  TwitchThemer = 'TwitchThemer',
  RetrievedLiveCodersTeamMembers = 'RetrievedLiveCodersTeamMembers',
  UserProfileUpdated = 'UserProfileUpdated',

  /* candle events */
  CandleReset = 'CandleReset',
  CandleVoteStart = 'CandleVoteStart',
  CandleVoteStop = 'CandleVoteStop',
  CandleVote = 'CandleVote',
  CandleWinner = 'CandleWinner',
  CandleVoteUpdate = 'CandleVoteUpdate'
}
