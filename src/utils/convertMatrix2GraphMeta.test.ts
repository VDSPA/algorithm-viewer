import { test, describe, expect } from "vitest";
import convertMatrix2GraphMeta from "./convertMatrix2GraphMeta";

describe("convertMatrix2GraphMeta", () => {

  describe("valid data", () => {

    test("without edge value", () => {
      const matrix: GraphAPI.Matrix = [
        [0, 0, 0, 5],
        [4, 0, 0, 0],
        [0, 0, 3, 0],
        [1, 0, 0, 0],
      ];

      const res: GraphAPI.Meta = {
        nodes: [
          { id: "0", label: "0" },
          { id: "1", label: "1" },
          { id: "2", label: "2" },
          { id: "3", label: "3" }
        ],
        edges: [
          { id: "0:3", target: "3", source: "0", value: 5 },
          { id: "1:0", target: "0", source: "1", value: 4 },
          { id: "2:2", target: "2", source: "2", value: 3 },
          { id: "3:0", target: "0", source: "3", value: 1 }
        ]
      };

      expect(convertMatrix2GraphMeta(matrix)).toEqual(res);
    });

    test("empty", () => {
      const res: GraphAPI.Meta = {
        nodes: [],
        edges: []
      };

      expect(convertMatrix2GraphMeta([])).toEqual(res);
    });
  });

  describe("invalid data", () => {

    test("shape invalid", () => {
      const martix = [[1], []];

      expect(convertMatrix2GraphMeta(martix)).toEqual(null);
    });
  });

});
