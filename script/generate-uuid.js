#!/usr/bin/env node
import { randomUUID } from "node:crypto";

const uuid = randomUUID();

console.log(`Generated UUID: ${uuid}`);
