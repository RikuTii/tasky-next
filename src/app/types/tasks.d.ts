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
    taskListMetas?: TaskListMeta[];
    tasks?: Task[];
  };
  
export type Task = {
    id?: number;
    title?: string;
    createdDate?: string;
    creator?: any;
    taskList?: Tasklist;
    status?: number;
    taskListId?: number;
};

export enum TaskStatus
{
  NotCreated,
  NotDone,
  Done
}