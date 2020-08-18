// Copyright 2020 The MathWorks, Inc.

import * as install from "./install";
import * as script from "./script";
import * as core from "@actions/core";
import properties from "./properties.json";

jest.mock("@actions/core");
jest.mock("./script");

afterEach(() => {
    jest.resetAllMocks();
});

describe("install procedure", () => {
    let downloadAndRunScriptMock: jest.Mock<any, any>;

    beforeEach(() => {
        downloadAndRunScriptMock = script.downloadAndRunScript as jest.Mock;

        // Mock core.group to simply return the output of the func it gets from
        // the caller
        (core.group as jest.Mock).mockImplementation(async (_, func) => {
            return func();
        });
    });

    it("ideally works", async () => {
        downloadAndRunScriptMock.mockResolvedValue(undefined);

        await expect(install.install()).resolves.toBeUndefined();
        expect(downloadAndRunScriptMock).toHaveBeenCalledTimes(2);
    });

    it("rejects when the download fails", async () => {
        downloadAndRunScriptMock.mockRejectedValueOnce(Error("oof"));

        await expect(install.install()).rejects.toBeDefined();
        expect(downloadAndRunScriptMock).toHaveBeenCalledTimes(1);
        expect(core.group).toHaveBeenCalledTimes(1);
    });

    it("rejects when executing the command returns with a non-zero code", async () => {
        downloadAndRunScriptMock
            .mockResolvedValueOnce(undefined)
            .mockRejectedValueOnce(Error("oof"));

        await expect(install.install()).rejects.toBeDefined();
        expect(downloadAndRunScriptMock).toHaveBeenCalledTimes(2);
        expect(core.group).toHaveBeenCalledTimes(2);
    });
});
