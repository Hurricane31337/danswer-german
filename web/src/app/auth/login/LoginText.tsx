"use client";

import React, { useContext } from "react";
import { SettingsContext } from "@/components/settings/SettingsProvider";

export const LoginText = () => {
  const settings = useContext(SettingsContext);
  return (
    <>
      Bei{" "}
      {(settings && settings?.enterpriseSettings?.application_name) ||
        "Label KI"}{" "}
      anmelden
    </>
  );
};
