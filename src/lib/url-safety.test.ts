import { describe, expect, it } from "vitest";
import { isBlockedHost } from "./url-safety";

describe("isBlockedHost", () => {
  it.each([
    "localhost",
    "LOCALHOST",
    "127.0.0.1",
    "::1",
    "192.168.0.1",
    "192.168.1.100",
    "10.0.0.1",
    "10.255.255.255",
    "172.16.0.1",
    "172.31.255.255",
    "service.internal",
    "printer.local",
  ])("blocks %s", (host) => {
    expect(isBlockedHost(host)).toBe(true);
  });

  it.each([
    "example.com",
    "images.unsplash.com",
    "172.15.0.1", // just outside the 172.16-31 private range
    "172.32.0.1", // just outside the 172.16-31 private range
    "8.8.8.8",
    "sub.example.com",
  ])("allows %s", (host) => {
    expect(isBlockedHost(host)).toBe(false);
  });
});
