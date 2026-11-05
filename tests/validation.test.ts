import { test } from "node:test";
import assert from "node:assert/strict";
import {
  hospitalToday,
  loginValues,
  validateForm,
} from "../src/app/(auth)/validation";

function form(overrides: Record<string, string> = {}) {
  const data = new FormData();
  Object.entries({
    firstName: "Ana",
    lastName: "Pérez",
    email: " Ana@Example.com ",
    password: " pass ",
    confirmPassword: " pass ",
    nationalIdentificationNumber: "01234567",
    phoneNumber: "+598 99 123 456",
    dateOfBirth: "2000-01-01",
    ...overrides,
  }).forEach(([key, value]) => data.set(key, value));
  return data;
}
test("registration preserves leading zeros and password, normalizes email", () => {
  const { values, errors } = validateForm(form(), true);
  assert.deepEqual(errors, {});
  assert.equal(values.email, "ana@example.com");
  assert.equal(values.password, " pass ");
  assert.equal(values.nationalIdentificationNumber, "01234567");
});
test("rejects internal email spaces, non-ASCII ID, invalid dates and phone", () => {
  const { errors } = validateForm(
    form({
      email: "a b@example.com",
      nationalIdentificationNumber: "０１２３４５６７",
      dateOfBirth: "2025-02-30",
      phoneNumber: "hello",
    }),
    true,
  );
  assert.deepEqual(
    Object.keys(errors).sort(),
    [
      "dateOfBirth",
      "email",
      "nationalIdentificationNumber",
      "phoneNumber",
    ].sort(),
  );
});
test("hospital today is accepted and a future date is rejected", () => {
  assert.equal(
    validateForm(form({ dateOfBirth: hospitalToday() }), true).errors
      .dateOfBirth,
    undefined,
  );
  assert.ok(
    validateForm(form({ dateOfBirth: "9999-12-31" }), true).errors.dateOfBirth,
  );
});
test("file arguments and oversized password fail server validation", () => {
  const data = form({ password: "1234567890123" });
  data.set("nationalIdentificationNumber", new Blob(["01010101"]), "id.txt");
  assert.deepEqual(Object.keys(validateForm(data, false).errors).sort(), [
    "nationalIdentificationNumber",
    "password",
  ]);
});

test("login requires only the exact ID and password, never email", () => {
  const data = form({ nationalIdentificationNumber: "01010101" });
  data.delete("email");
  const { values, errors } = validateForm(data, false);
  assert.deepEqual(errors, {});
  assert.deepEqual(loginValues(values), {
    nationalIdentificationNumber: "01010101",
    password: " pass ",
  });
  data.set("email", "not an email");
  assert.deepEqual(validateForm(data, false).errors, {});
});

test("login and registration reject every non-exact ASCII ID without normalization", () => {
  for (const id of [
    "",
    "1234567",
    "123456789",
    " 01010101",
    "01010101 ",
    "01010101\n",
    "01 010101",
    "01.010.101",
    "0101010-1",
    "０１０１０１０１",
    "٠١٠١٠١٠١",
  ]) {
    for (const registration of [false, true]) {
      const { values, errors } = validateForm(
        form({ nationalIdentificationNumber: id }),
        registration,
      );
      assert.ok(errors.nationalIdentificationNumber, JSON.stringify(id));
      assert.equal(values.nationalIdentificationNumber, id);
    }
  }
});

test("an email cannot replace an absent login ID; registration still requires email", () => {
  const data = form();
  data.delete("nationalIdentificationNumber");
  assert.ok(validateForm(data, false).errors.nationalIdentificationNumber);
  const registration = form({ email: "" });
  assert.ok(validateForm(registration, true).errors.email);
});

test("registration requires exact password confirmation without adding it to the API body", () => {
  for (const confirmPassword of ["", "different", "pass", " pass"]) {
    assert.deepEqual(
      validateForm(form({ confirmPassword }), true).errors.confirmPassword,
      ["Passwords must match."],
    );
  }
  const data = form();
  data.delete("confirmPassword");
  assert.ok(validateForm(data, true).errors.confirmPassword);
  const result = validateForm(form(), true);
  assert.deepEqual(result.errors, {});
  assert.equal("confirmPassword" in result.values, false);
  assert.equal(validateForm(data, false).errors.confirmPassword, undefined);
});
