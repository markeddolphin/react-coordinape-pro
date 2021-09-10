import { RecoilValue } from 'recoil';
import { IEpoch, IUser } from './models';

export interface IRecoilGetParams {
  get: <T>(recoilState: RecoilValue<T>) => T;
}

export interface IRecoilSetParams {
  get: <T>(recoilState: RecoilValue<T>) => T;
  set: <T>(
    recoilVal: RecoilState<T>,
    newVal: T | DefaultValue | ((prevValue: T) => T | DefaultValue)
  ) => void;
  reset: (recoilVal: RecoilState<any>) => void; // eslint-disable-line @typescript-eslint/no-explicit-any
}

// This will eventually be a backend DB model
export interface IProfile {
  bio: string;
}

export interface ISimpleGift {
  user: IUser;
  tokens: number;
  note: string;
}

export interface ITiming {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export interface IEpochTiming {
  hasBegun: boolean;
  timeUntilStart: ITiming;
  hasEnded: boolean;
  timeUntilEnd: ITiming;
}

export interface IEpochTimings {
  previousEpochTiming?: IEpochTiming;
  currentEpochTiming?: IEpochTiming;
  nextEpochTiming?: IEpochTiming;
}

interface IUserGift {
  user: IUser;
  gift: ITokenGift;
}

export interface IAtomEffectParams {
  node: RecoilState<T>;
  trigger: 'set' | 'get';

  // Call synchronously to initialize value or async to change it later
  setSelf: (
    param:
      | T
      | DefaultValue
      | Promise<T | DefaultValue>
      | ((param: T | DefaultValue) => T | DefaultValue)
  ) => void;
  resetSelf: () => void;

  // Subscribe callbacks to events.
  // Atom effect observers are called before global transaction observers
  onSet: (
    param: (newValue: T | DefaultValue, oldValue: T | DefaultValue) => void
  ) => void;
}
