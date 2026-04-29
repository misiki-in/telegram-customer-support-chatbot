import { factory } from "@/db";
import { CreateClickHistory, CreateSearchHistory } from "@/db/schema";
import type { FlowJobData, Job } from "bunqueue/client";
import { Bunqueue } from 'bunqueue/client';

// Batching can be used here to make this more
// efficient.
const analyticsQueue= new Bunqueue('analytics', {
  embedded: true,
  routes: {
    'click': handleClick,
    'search': handleSearch,
  },
});

// Validation can be used before pushing data
// to database here.
export async function handleClick(job: Job<FlowJobData>) {
  await factory.clickHistory.create(job.data)
}

export async function handleSearch(job: Job<FlowJobData>) {
  await factory.searchHistory.create(job.data)
}

export function pushClickEvent(event: CreateClickHistory) {
  analyticsQueue.add('click', event)
}

export function pushSearchEvent(event: CreateSearchHistory) {
  analyticsQueue.add('search', event)
}
