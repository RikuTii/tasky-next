import { User } from "./global";

export type TaskListMeta = {
  userAccount: User;
  tasklistId?: number;
  creatorId?: number;
};
export type Tasklist = {
    id?: number;
    name?: string;
    createdDate?: string;
    creator?: User;
    description?: string;
    taskListMetas?: TaskListMeta[];
    tasks?: Task[];
  };

export type File = {
  createdDate?: string;
  name?: string;
  path?: string;
  type?: string;
};

type TaskMeta = {
  file?: File;
  id: number;
};

export type Task = {
    id?: number;
    title?: string;
    description?: string;
    createdDate?: string;
    creator?: any;
    taskList?: Tasklist;
    status?: number;
    taskListId?: number;
    meta?: TaskMeta[];
    isPast?: number;
    scheduleDate?: string;
    timeTrack?: number;
    timeElapsed?: number;
    timeEstimate?: number;

};

export enum TaskStatus
{
  NotCreated,
  NotDone,
  Done
}