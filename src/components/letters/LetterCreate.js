import React, { useEffect, useState } from "react";
import {
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  TextField,
  Typography,
} from "@mui/material";
import { Autocomplete } from "@mui/material";
import { styled } from "@mui/system";
import { ghostInput } from "../../managers/GhostManager";
import { getContacts } from "../../managers/ContactManager";
import { getTones } from "../../managers/ToneManager";
import { getUser } from "../../managers/UserManager";
import { createLetter } from "../../managers/LetterManager";

const FormContainer = styled("form")({
  display: "flex",
  flexDirection: "column",
  gap: "16px",
  maxWidth: "400px",
  margin: "auto",
});

const Heading = styled(Typography)({
  textAlign: "center",
});

export const LetterCreate = () => {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState("");
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [tones, setTones] = useState([]);
  const [selectedTones, setSelectedTones] = useState([]);
  const [user, setUser] = useState({});
  const [letterPurpose, setLetterPurpose] = useState("");
  const [letterObj, setLetterObj] = useState(null);

  useEffect(() => {
    getUser().then((data) => setUser(data));
  }, []);

  useEffect(() => {
    getContacts().then((data) => setContacts(data));
  }, []);

  useEffect(() => {
    getTones().then((data) => setTones(data));
  }, []);

  const handleAIResponseGenerate = async (e) => {
    e.preventDefault();

    setLoading(true); // Start loading animation

    try {
      const userObj = {
        name: user.first_name + " " + user.last_name,
        bio: user.ghostuser.bio,
      };

      const contact = {
        name: selectedContact.first_name + " " + selectedContact.last_name,
        bio: selectedContact.bio,
      };

      const tones = selectedTones.map((tone) => tone.label).join(", ");

      const userInput = `The letter you are writing is from ${user.name}. Here is a bio for your reference: ${user.bio}.
      It is being written to ${contact.name}. Here is a bio on ${contact.name} for your reference: ${contact.bio}.
      The purpose of the letter is ${letterPurpose} and the tones of the letter should be ${tones}.`;

      const generatedResponse = await ghostInput(userInput);
      setResponse(generatedResponse);

      const currentDate = new Date().toISOString().split("T")[0];
      const newLetterObj = {
        contact: selectedContact.id,
        user: user.id,
        letter_body: generatedResponse,
        date: currentDate,
      };

      // Update the state variables
      setLetterObj(newLetterObj);
      setResponse(generatedResponse);
    } catch (error) {
      console.error("Error:", error);
    }

    setLoading(false); // Stop loading animation
  };

  const handleLetterSave = async (e) => {
    e.preventDefault();

    setLoading(true); // Start loading animation

    try {
      await createLetter(letterObj);

      setResponse("");
      setSelectedContact(null);
      setSelectedTones([]);
      setLetterPurpose("");
      setLetterObj(null);
    } catch (error) {
      console.error("Error:", error);
    }

    setLoading(false); // Stop loading animation
  };

  const handleContactChange = (event, value) => {
    setSelectedContact(value);
  };

  const handleToneChange = (event, values) => {
    setSelectedTones(values);
  };

  const sortedContacts = contacts.sort((a, b) =>
    `${a.first_name} ${a.last_name}`.localeCompare(
      `${b.first_name} ${b.last_name}`
    )
  );

  const sortedTones = tones.sort((a, b) => a.label.localeCompare(b.label));

  return (
    <FormContainer onSubmit={handleAIResponseGenerate}>
    <Autocomplete
      fullWidth
      options={sortedContacts}
      getOptionLabel={(contact) =>
        `${contact.first_name} ${contact.last_name}`
      }
      value={selectedContact}
      onChange={handleContactChange}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Select Contact"
          sx={{ mt: 4 }}
        />
      )}
      limitTags={4}
    />
      <Autocomplete
        fullWidth
        multiple
        options={sortedTones}
        getOptionLabel={(tone) => tone.label}
        value={selectedTones}
        onChange={handleToneChange}
        renderInput={(params) => (
          <TextField {...params} label="Select Tones" />
        )}
        limitTags={4}
      />
      <TextField
        fullWidth
        value={letterPurpose}
        onChange={(e) => setLetterPurpose(e.target.value)}
        label="Letter Purpose"
        multiline
        rows={4}
        placeholder="Enter your message"
      />
      <Button type="submit" disabled={loading}>
        {loading ? <CircularProgress size={24} /> : "Generate Letter"}
      </Button>

      {response && (
        <>
          <TextField
            fullWidth
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            label="Edit the letter"
            multiline
            rows={10}
            placeholder="Edit the letter"
            autoFocus
            autoComplete="off"
            inputProps={{ style: { resize: "vertical" } }}
          />
          <Button onClick={handleLetterSave} disabled={loading}>
            {loading ? <CircularProgress size={24} /> : "Save Letter"}
          </Button>
        </>
      )}
    </FormContainer>
  );
};
