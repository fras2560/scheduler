import React from "react";

import { render, cleanup } from "@testing-library/react";

import { waitForElement, fireEvent, prettyDOM, getByTestId, getByText, getAllByTestId, getByAltText, getByPlaceholderText, queryByText } from "@testing-library/react";
import Application from "components/Application";
import axios from "__mocks__/axios";

afterEach(cleanup);

describe("Application", () => {
  it("defaults to Monday and changes the schedule when a new day is selected", async () => {
    const { getByText } = render(<Application />);

    await waitForElement(() => getByText("Monday"));

    fireEvent.click(getByText("Tuesday"));

    expect(getByText("Leopold Silvers")).toBeInTheDocument();
  });

  it("loads data, books an interview and reduces the spots remaining for the first day by 1", async () => {
    const { container } = render(<Application />);
    await waitForElement(() => getByText(container, "Archie Cohen"));
    const appointments = getAllByTestId(container, "appointment");
    const appointment = appointments[0];
    const addBtn = getByAltText(appointment, "Add");
    fireEvent.click(addBtn);
    fireEvent.change(getByPlaceholderText(appointment, /enter student name/i), {
      target: { value: "Lydia Miller-Jones" }
    });
    fireEvent.click(getByAltText(appointment, "Sylvia Palmer"));
    
    fireEvent.click(getByText(appointment, "Save"));
    expect(getByText(appointment, "Saving")).toBeInTheDocument();

    await waitForElement(() => getByText(appointment, "Lydia Miller-Jones"));

    const day = getAllByTestId(container, "day").find(day =>
      queryByText(day, "Monday")
    );
  });

  it("loads data, books an interview and reduces the spots remaining for Monday by 1", async () => {
    // 1. Render the Application.
    const { container, debug } = render(<Application />);
    // 2. Wait until the text "Archie Cohen" is displayed.
    await waitForElement(() => getByText(container, "Archie Cohen"));
    // 3. Click the "Delete" button on the booked appointment.
    const appointment = getAllByTestId(container, "appointment").find(
      appointment => queryByText(appointment, "Archie Cohen")
    );
    const delBtn = getByAltText(appointment, "Delete");
    fireEvent.click(delBtn);
    // 4. Check that the confirmation message is shown.
    expect(getByText(appointment, "Are you sure you would like to delete?")).toBeInTheDocument();

    // 5. Click the "Confirm" button on the confirmation.
    const confirmBtn = getByText(appointment, "Confirm");
    fireEvent.click(confirmBtn);
    // 6. Check that the element with the text "Deleting" is displayed.
    expect(getByText(appointment, "Deleting")).toBeInTheDocument();
    // 7. Wait until the element with the "Add" button is displayed.
    await waitForElement(() => getByAltText(appointment, 'Add'));
    // 8. Check that the DayListItem with the text "Monday" also has the text "2 spots remaining".
    const day = getAllByTestId(container, "day").find(day =>
      queryByText(day, "Monday")
    );
    expect(getByText(day, '2 spots remaining'));
  });
  it("loads data, edits an interview and keeps the spots remaining for Monday the same", async () => {
    // 1. Render the Application.
    const { container, debug } = render(<Application />);
    // 2. Wait until the text "Archie Cohen" is displayed.
    await waitForElement(() => getByText(container, "Archie Cohen"));
    // 3. Click the "Edit" button on the booked appointment.
    const appointment = getAllByTestId(container, "appointment").find(
      appointment => queryByText(appointment, "Archie Cohen")
    );
    const editBtn = getByAltText(appointment, "Edit");
    fireEvent.click(editBtn);
    // 4. Change my name
    fireEvent.change(getByTestId(appointment, "student-name-input"), {
      target: { value: "Dallas Fraser" },
    });
    // 5. click save button
    const saveBtn = getByText(appointment, "Save");
    fireEvent.click(saveBtn);

    // 6. Assert saving is shown
    expect(getByText(appointment, "Saving")).toBeInTheDocument();

    // 6. Ensure name has changed
    await waitForElement(() => getByText(appointment, 'Dallas Fraser'));
    // 8. Check that the DayListItem with the text "Monday" also has the text "1 spot remaining".
    const day = getAllByTestId(container, "day").find(day =>
      queryByText(day, "Monday")
    );
    expect(getByText(day, '1 spot remaining'));
  });
  it("shows the save error when failing to save an appointment", async () => {
    axios.put.mockRejectedValueOnce();
    // 1. Render the Application.
    const { container, debug } = render(<Application />);
    // 2. Wait until the text "Archie Cohen" is displayed.
    await waitForElement(() => getByText(container, "Archie Cohen"));
    // 3. Click the "Edit" button on the booked appointment.
    const appointment = getAllByTestId(container, "appointment").find(
      appointment => queryByText(appointment, "Archie Cohen")
    );
    const editBtn = getByAltText(appointment, "Edit");
    fireEvent.click(editBtn);
    // 4. Change my name
    fireEvent.change(getByTestId(appointment, "student-name-input"), {
      target: { value: "Dallas Fraser" },
    });
    // 5. click save button
    const saveBtn = getByText(appointment, "Save");
    fireEvent.click(saveBtn);
    // 6. Assert saving is shown
    expect(getByText(appointment, "Saving")).toBeInTheDocument();
    // 7. Should see an error
    await waitForElement(() => getByText(appointment, 'Error'));
  });
  it("shows the delete error when failing to delete an existing appointment", async () => {
    axios.delete.mockRejectedValueOnce();
    // 1. Render the Application.
    const { container, debug } = render(<Application />);
    // 2. Wait until the text "Archie Cohen" is displayed.
    await waitForElement(() => getByText(container, "Archie Cohen"));
    // 3. Click the "Delete" button on the booked appointment.
    const appointment = getAllByTestId(container, "appointment").find(
      appointment => queryByText(appointment, "Archie Cohen")
    );
    const delBtn = getByAltText(appointment, "Delete");
    fireEvent.click(delBtn);
    // 4. Check that the confirmation message is shown.
    expect(getByText(appointment, "Are you sure you would like to delete?")).toBeInTheDocument();

    // 5. Click the "Confirm" button on the confirmation.
    const confirmBtn = getByText(appointment, "Confirm");
    fireEvent.click(confirmBtn);
    // 6. Check that the element with the text "Deleting" is displayed.
    expect(getByText(appointment, "Deleting")).toBeInTheDocument();
    // 7. Should see an error
    await waitForElement(() => getByText(appointment, 'Error'));
  });
});