/*
====================================================================================================================================
  REDCap-LookerStudio-Connector by Alvaro A. Alvarez Peralta.
====================================================================================================================================
  Version:      1.0
  Project Page: https://github.com/aandresalvarez/REDCap-LookerStudio-Connector
  Copyright:    (c)  2019 by Alvaro A. Alvarez Peralta
  License:      GNU General Public License, version 3 (GPL-3.0)
  ------------------------------------------------------------------------------------------------------------------------------------
  A connector for importing REDCap data into Looker Studio.

  Detailed instructions for installation and usage can be found in the README.md file.
  ------------------------------------------------------------------------------------------------------------------------------------
*/

// Function to get the authentication type; currently set to 'NONE'.
function getAuthType() {
  return { type: 'NONE' };
}

// Function to check if the user is an admin; hardcoded to true for now.
function isAdminUser() {
  return true;
}

// Function to configure the connector settings that will appear in Looker Studio.
function getConfig(request) {
  const cc = DataStudioApp.createCommunityConnector();
  const config = cc.getConfig();

  // Instructions for entering REDCap URL
  config.newInfo()
        .setId('instructions')
        .setText('Enter REDCap URL');

  // Input for REDCap URL
  config.newTextInput()
        .setId('redcap_url')
        .setName('Enter REDCap URL')
        .setPlaceholder('https://redcap.example.com/api/')
        .setHelpText('e.g. https://redcap.example.com/api/');

  // Input for REDCap API token
  config.newTextInput()
        .setId('redcap_token')
        .setName('Enter REDCap API token')
        .setPlaceholder('API Token Here');

  // Additional configurations truncated for brevity

  return config.build();
}

// Function to throw user-specific exceptions
function sendUserError(message) {
  const cc = DataStudioApp.createCommunityConnector();
  cc.newUserError().setText(message).throwException();
}

// Function to call the REDCap API and fetch data
function CallREDCapAPI(request) {
  // Variable declarations
  let url, token, report_id, raw_label_headers, raw_label_data, export_checkbox_label;

  try {
    url = request.configParams.redcap_url;
  } catch (e) {
    console.error('Error url: ' + e);
  }

  // Additional code truncated for brevity

  return data;
}

// Function to fetch schema fields dynamically based on REDCap data
function getFields(request) {
  // Variable declarations
  const cc = DataStudioApp.createCommunityConnector();
  const fields = cc.getFields();
  const types = cc.FieldType;

  // Additional code truncated for brevity

  return fields;
}

// Additional functions truncated for brevity
