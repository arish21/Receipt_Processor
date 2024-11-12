const { calculatePoints } = require("../server.js");

describe("Receipt Processing Tests", () => {
  test("Valid receipt with expected points", () => {
    const receipt = {
      retailer: "Target",
      purchaseDate: "2022-01-01",
      purchaseTime: "13:01",
      items: [
        { shortDescription: "Mountain Dew 12PK", price: "6.49" },
        { shortDescription: "Emils Cheese Pizza", price: "12.25" },
        { shortDescription: "Knorr Creamy Chicken", price: "1.26" },
        { shortDescription: "Doritos Nacho Cheese", price: "3.35" },
        { shortDescription: "   Klarbrunn 12-PK 12 FL OZ  ", price: "12.00" },
      ],
      total: "35.35",
    };

    const expectedPoints = 28;
    const points = calculatePoints(receipt);
    expect(points).toBe(expectedPoints);
  });

  test("Receipt with missing retailer should throw error", () => {
    const receipt = {
      purchaseDate: "2022-01-01",
      purchaseTime: "13:01",
      items: [
        { shortDescription: "Mountain Dew 12PK", price: "6.49" },
        { shortDescription: "Emils Cheese Pizza", price: "12.25" },
      ],
      total: "18.74",
    };

    expect(() => calculatePoints(receipt)).toThrow(
      "Retailer name is required and must be a non-empty string"
    );
  });

  test("Receipt with invalid total should throw error", () => {
    const receipt = {
      retailer: "Target",
      purchaseDate: "2022-01-01",
      purchaseTime: "13:01",
      items: [{ shortDescription: "Mountain Dew 12PK", price: "6.49" }],
      total: "invalidTotal",
    };

    expect(() => calculatePoints(receipt)).toThrow(
      "Invalid total value. Must be a numeric string."
    );
  });

  test("Receipt with invalid date format should throw error", () => {
    const receipt = {
      retailer: "Target",
      purchaseDate: "2022-13-01", // Invalid month
      purchaseTime: "13:01",
      items: [{ shortDescription: "Mountain Dew 12PK", price: "6.49" }],
      total: "6.49",
    };

    expect(() => calculatePoints(receipt)).toThrow(
      "Invalid date format. Must be YYYY-MM-DD"
    );
  });

  test("Receipt with invalid time format should throw error", () => {
    const receipt = {
      retailer: "Target",
      purchaseDate: "2022-01-01",
      purchaseTime: "25:00", // Invalid hour
      items: [{ shortDescription: "Mountain Dew 12PK", price: "6.49" }],
      total: "6.49",
    };

    expect(() => calculatePoints(receipt)).toThrow(
      "Invalid time format. Must be HH:MM"
    );
  });

  test("Receipt with missing items array should throw error", () => {
    const receipt = {
      retailer: "Target",
      purchaseDate: "2022-01-01",
      purchaseTime: "13:01",
      total: "6.49",
    };

    expect(() => calculatePoints(receipt)).toThrow(
      "Items array must be a non-empty array"
    );
  });

  test("Points calculation when the total is a round dollar", () => {
    const receipt = {
      retailer: "Target",
      purchaseDate: "2022-01-01",
      purchaseTime: "13:01",
      items: [{ shortDescription: "Mountain Dew", price: "5.00" }],
      total: "5.00",
    };

    const expectedPoints = 88;
    const points = calculatePoints(receipt);
    expect(points).toBe(expectedPoints);
  });

  test("Points calculation when total is a multiple of 0.25", () => {
    const receipt = {
      retailer: "Target",
      purchaseDate: "2022-01-01",
      purchaseTime: "13:01",
      items: [{ shortDescription: "Mountain Dew", price: "6.50" }],
      total: "6.50", // Multiple of 0.25
    };

    const expectedPoints = 39;
    const points = calculatePoints(receipt);
    expect(points).toBe(expectedPoints);
  });

  test("Receipt with even day should not get odd day points", () => {
    const receipt = {
      retailer: "Target",
      purchaseDate: "2022-01-02",
      purchaseTime: "13:01",
      items: [{ shortDescription: "Mountain Dew", price: "6.49" }],
      total: "6.49",
    };

    const expectedPoints = 8;
    const points = calculatePoints(receipt);
    expect(points).toBe(expectedPoints);
  });

  test("Points should not be awarded if the item price is invalid", () => {
    const receipt = {
      retailer: "Target",
      purchaseDate: "2022-01-01",
      purchaseTime: "13:01",
      items: [{ shortDescription: "Mountain Dew", price: "invalidPrice" }],
      total: "6.49",
    };

    expect(() => calculatePoints(receipt)).toThrow(
      "Item price must be a valid number"
    );
  });

  test("Receipt with no items should get no points", () => {
    const receipt = {
      retailer: "Target",
      purchaseDate: "2022-01-01",
      purchaseTime: "13:01",
      items: [],
      total: "0.00",
    };

    const expectedPoints = 0; // No points for no items
    const points = calculatePoints(receipt);
    expect(points).toBe(expectedPoints);
  });
});
