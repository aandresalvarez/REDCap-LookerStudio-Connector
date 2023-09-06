/* 
====================================================================================================================================
  REDCap-LookerStudio-Connector by Alvaro A. Alvarez Peralta.
====================================================================================================================================
  Version:      1.1
  Project Page: https://github.com/aandresalvarez/REDCap-LookerStudio-Connector
  Copyright:    (c)  2019 by Alvaro A. Alvarez Peralta
  License:      GNU General Public License, version 3 (GPL-3.0)
  ------------------------------------------------------------------------------------------------------------------------------------
  A connector for importing REDCap data into Looker Studio.

  For detailed installation and usage instructions, refer to the README.md file.
  For future enhancements, consult the GitHub project page.
  For bug reports, use the GitHub issues section.
  ------------------------------------------------------------------------------------------------------------------------------------
*/

/**
 * Returns the authentication type for the connector.
 * In this case, it returns 'NONE' as no authentication is required.
 */
function getAuthType() {
  var response = { type: 'NONE' };
  return response;
}

/**
 * Returns whether the current user is an admin user.
 * In this case, it always returns true.
 */
function isAdminUser(){ 
  return true;
}

/**
 * Returns the configuration for the connector.
 * It defines the input fields required for the connector setup.
 */
function getConfig(request) {
  var cc = DataStudioApp.createCommunityConnector();
  var config = cc.getConfig();
  
  config
    .newInfo()
    .setId('instructions')
    .setText('Enter REDCap url');
  
  config
    .newTextInput()
    .setId('redcap_url')
    .setName('Enter REDCap url')
    .setHelpText('e.g. https://redcap.stanford.edu/api/')
    .setPlaceholder('https://redcap.stanford.edu/api/');
  
  config
    .newTextInput()
    .setId('redcap_token')
    .setName('Enter REDCap API token.')
    .setHelpText("To obtain an API token for a project in REDCap, you need to follow a few steps. First, navigate to the specific project you want to connect to. Once you're on the project page, look for the "API" link in the Applications sidebar. Clicking on this link will take you to the API page. On this page, you have the option to request an API token for the project from your REDCap administrator. If an API token has already been assigned to you, it will be displayed on the API page as well. However, if you don't see the API link in your project's left-hand menu, it means you don't have API privileges within the project. In this case, you'll need someone with API privileges to grant you access via the project's User Rights page. Once you have the API token, you can use it to authenticate and connect to the project in the REDCap-LookerStudio-Connector.")
    .setPlaceholder('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
          
  config
    .newTextInput()
    .setId('redcap_report_id')
    .setHelpText('e.g. You can find the report id by accesing Data Exports, Reports, and Stats in your REDcap project. (or keep this empty for all fields)')
    .setName('Enter the Report Id');
    
  var option1 = config
                 .newOptionBuilder()
                 .setLabel("Raw")
                 .setValue("raw");

  var option2 = config
                 .newOptionBuilder()
                 .setLabel("Label")
                 .setValue("label");

  config
    .newSelectSingle()
    .setId("raw_label_data")
    .setName("Raw or Label Data")
    .setHelpText("Select the data type you're interested in.")
    .setAllowOverride(true)
    .addOption(option1)
    .addOption(option2); 
 
  config
    .newSelectSingle()
    .setId("raw_label_headers")
    .setName("Raw or Label Headers")
    .setHelpText("Select the Headers type you're interested in.")
    .setAllowOverride(true)
    .addOption(option1)
    .addOption(option2);
  
  config
    .newCheckbox()
    .setId("export_checkbox_label")
    .setName("Checkbox Labels?")
    .setHelpText("Whether or not Checkbox Labels should be used.")
    .setAllowOverride(true);  
  
  config
    .setDateRangeRequired(true);  
  
  return config.build();
}

/**
 * Throws a user error with the given message.
 */
function sendUserError(message) {
  var cc = DataStudioApp.createCommunityConnector();
  cc.newUserError()
    .setText(message)
    .throwException();
}

/**
 * Calls the REDCap API to fetch the data based on the provided configuration.
 * Returns the fetched data.
 */
function CallREDcapAPI(request) {
  try {
    var url = request.configParams.redcap_url; 
  } catch (e) {
    console.error('Error url: ' + e);
  }
  
  var token = request.configParams.redcap_token;   
  var report_id = request.configParams.redcap_report_id;
  var raw_label_headers = request.configParams.raw_label_headers; 
  var raw_label_data = request.configParams.raw_label_data;
  var export_checkbox_label = request.configParams.export_checkbox_label;
  
  if (!url || !url.match(/^(https|http)?:\/\/.+$/g)) {
    sendUserError('"' + url + '" is not a valid url. Verify that the address entered is correct, usually ending with "/api/". ');  
  }  
   
  if (!token) {   
    sendUserError('"' + token + '" is not a valid token.');  
  }
  
  if (!export_checkbox_label) {
    export_checkbox_label = 'false';
  }
  
  if (!report_id) {
    report_id = "ALL";
  }
 
  var formData = {
    'token': token,
    'content': 'report',
    'format': 'json',
    'format': 'json',
    'report_id': report_id,
    'rawOrLabel': raw_label_data,
    'rawOrLabelHeaders': raw_label_headers,
    'exportCheckboxLabel': export_checkbox_label,
    'returnFormat': 'false'    
  };
  
  var options = {
    'method' : 'post',
    'payload' : formData
  };
  
  var response = UrlFetchApp.fetch(url, options); 
  var json = response.getContentText();  
  if (!json) {
    sendUserError('"' + url + '" returned no content.');
  } 
  var data = JSON.parse(json);
  return data;
}

/**
 * Retrieves the fields from the REDCap API response and creates dimensions for each field.
 * Returns the fields.
 */
function getFields(request) {
  var cc = DataStudioApp.createCommunityConnector();
  var fields = cc.getFields();
  var types = cc.FieldType;
  var aggregations = cc.AggregationType;
  var flattened = CallREDcapAPI(request);
  
  var fieldsFound = [];
  for (var i = 0; i < flattened.length; i++) {  
    for (entry in flattened[i]) {     
      if (fieldsFound.indexOf(entry) == -1) {     
        fieldsFound.push(entry);         
        if (entry == "redcap_repeat_instance") {
          fields.newDimension()
            .setId(entry)
            .setName(entry)
            .setType(types.NUMBER);
        } else {
          fields.newDimension()
            .setId(entry)
            .setName(entry)
            .setType(types.TEXT);
        }
      }            
    }     
  } 
  return fields;
}

/**
 * Retrieves the schema for the connector.
 * Returns the schema.
 */
function getSchema(request) {
  var fields = getFields(request).build();
  return { schema: fields };
}

/**
 * Transforms the API response data into rows based on the requested fields.
 * Returns the transformed rows.
 */
function responseToRows(requestedFields, redcapData) {
  return redcapData.map(function(data) {
    var row = [];
    requestedFields.asArray().forEach(function (field) {
      var text = field.getId(); 
      return  row.push(data[text]);
    });
    return { values: row };
  });
}

/**
 * Retrieves the data based on the requested fields and the REDCap API response.
 * Returns the data.
 */
function getData(request) {
  var requestedFieldIds = request.fields.map(function(field) {
    return field.name;
  });
  var requestedFields = getFields(request).forIds(requestedFieldIds);
  var data = CallREDcapAPI(request);
  var rows = responseToRows(requestedFields, data);
  var result = {
    schema: requestedFields.build(),
    rows: rows       
  };
  return result;
}
