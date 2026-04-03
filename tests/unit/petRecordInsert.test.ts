import { describe, it, expect } from "vitest";
import { petRecordRowFromDeadPet } from "@/lib/pets/petRecordInsert";
import { makePet } from "../factories/pet";

describe("petRecordRowFromDeadPet", () => {
  it("devolve null se o pet está vivo", () => {
    expect(petRecordRowFromDeadPet(makePet(), "u1")).toBeNull();
  });

  it("monta linha com died_at preferido", () => {
    const row = petRecordRowFromDeadPet(
      makePet({
        is_alive: false,
        name: "Zé",
        stage: "adult",
        character_type: "adult_cared",
        age_minutes: 99,
        born_at: "2024-01-01T10:00:00.000Z",
        died_at: "2024-01-02T10:00:00.000Z",
        last_decay_at: "2024-01-02T09:00:00.000Z",
      }),
      "user-abc",
    );
    expect(row).toEqual({
      user_id: "user-abc",
      pet_name: "Zé",
      stage: "adult",
      character_type: "adult_cared",
      age_minutes: 99,
      born_at: "2024-01-01T10:00:00.000Z",
      died_at: "2024-01-02T10:00:00.000Z",
    });
  });

  it("usa last_decay_at se died_at for null", () => {
    const row = petRecordRowFromDeadPet(
      makePet({
        is_alive: false,
        died_at: null,
        last_decay_at: "2024-01-02T09:00:00.000Z",
      }),
      "u1",
    );
    expect(row?.died_at).toBe("2024-01-02T09:00:00.000Z");
  });
});
