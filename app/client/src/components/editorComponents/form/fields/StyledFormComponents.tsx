import React from "react";
import styled from "styled-components";
import { Colors } from "constants/Colors";
import { ControlProps } from "components/formControls/BaseControl";

//Styled help text, intended to be used with Form Fields
export const StyledFormInfo = styled.span<{ config?: ControlProps }>`
  display: ${(props) =>
    props?.config?.controlType !== "SWITCH" &&
    props?.config?.controlType !== "CHECKBOX"
      ? "block;"
      : "inline;"}
  font-weight: normal;
  color: ${Colors.DOVE_GRAY};
  font-size: 12px;
  margin-left: 1px;
  margin-bottom: 8px;
`;

//Styled help text, intended to be used with Form Fields
const FormInputHelperText = styled.p`
  color: #858282;
  font-style: normal;
  font-weight: normal;
  font-size: 12px;
  line-height: 16px;
  letter-spacing: -0.221538px;
  margin: 0px;
`;

//Styled error text, intended to be used with Form Fields
const FormInputErrorText = styled.p`
  font-style: normal;
  font-weight: normal;
  font-size: 12px;
  line-height: 16px;
  letter-spacing: -0.221538px;
  color: #f22b2b;
  margin: 8px 0 0 0;
`;

//Styled anchor tag, intended to be used with Form Fields
const FormInputAnchor = styled.a`
  display: block;
  font-weight: 500;
  font-size: 12px;
  line-height: 14px;
  letter-spacing: 0.8px;
  color: #6a86ce;
  margin: 0 0 8px 0;
  text-transform: uppercase;
`;
const FormInputSwitchToJsonButton = styled.button`
  font-weight: 500;
  font-size: 12px;
  line-height: 14px;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  color: #6a86ce;
  margin: 0 0 8px 0;
  border: none;
  padding-left: 0px;
  display: block;
  cursor: pointer;
  background-color: #fff;
`;

//Styled form label tag, intended to be used with Form Fields
const StyledFormLabel = styled.label<{ config?: ControlProps }>`
  display: inline-block;
  // TODO: replace condition with props.config?.dataType === "TOGGLE" 
  min-width: ${(props) =>
    props.config?.controlType === "SWITCH" ||
    props.config?.controlType === "CHECKBOX"
      ? "auto;"
      : "50vh;"} 
  margin-left: ${(props) =>
    props.config?.controlType === "CHECKBOX" ? "0px;" : "16px;"} 
  font-weight: 400;
  font-size: 14px;
  line-height: 16px;
  letter-spacing: 0.02em;
  color: ${Colors.CHARCOAL};
  margin-bottom: 8px;

  &:first-child {
    margin-left: 0px;
  }
  p {
    display: flex;
  }
  .label-icon-wrapper {
    margin-bottom: 0px;
  }
  .label-icon-wrapper svg {
    position: relative;
    top: 3px;
  }
  .label-icon-wrapper svg path {
    fill: #939090;
  }
`;

interface FormLabelProps {
  config?: ControlProps;
  children: JSX.Element | React.ReactNode;
}

//Wrapper on styled <label/>
function FormLabel(props: FormLabelProps) {
  return (
    <StyledFormLabel config={props.config}>{props.children}</StyledFormLabel>
  );
}

//Wrapper on styled <span/>
function FormInfoText(props: FormLabelProps) {
  return (
    <StyledFormInfo config={props.config}>{props.children}</StyledFormInfo>
  );
}

export {
  FormInputSwitchToJsonButton,
  FormLabel,
  FormInputAnchor,
  FormInputErrorText,
  FormInputHelperText,
  FormInfoText,
};
