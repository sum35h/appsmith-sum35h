import { Action } from "entities/Action/index";
import _ from "lodash";
import { EvaluationSubstitutionType } from "entities/DataTree/dataTreeFactory";
import { isHidden } from "components/formControls/utils";
import { allowedControlTypes } from "components/formControls/EntitySelectorControl";

const dynamicFields = ["QUERY_DYNAMIC_TEXT", "QUERY_DYNAMIC_INPUT_TEXT"];

const getCorrectEvaluationSubstitutionType = (substitutionType?: string) => {
  if (substitutionType) {
    if (substitutionType === EvaluationSubstitutionType.SMART_SUBSTITUTE) {
      return EvaluationSubstitutionType.SMART_SUBSTITUTE;
    } else if (substitutionType === EvaluationSubstitutionType.PARAMETER) {
      return EvaluationSubstitutionType.PARAMETER;
    }
  }
  return EvaluationSubstitutionType.TEMPLATE;
};

export const getBindingPathsOfAction = (
  action: Action,
  formConfig?: any[],
): Record<string, EvaluationSubstitutionType> => {
  const bindingPaths: Record<string, EvaluationSubstitutionType> = {
    data: EvaluationSubstitutionType.TEMPLATE,
    isLoading: EvaluationSubstitutionType.TEMPLATE,
    datasourceUrl: EvaluationSubstitutionType.TEMPLATE,
  };
  if (!formConfig) {
    return {
      ...bindingPaths,
      config: EvaluationSubstitutionType.TEMPLATE,
    };
  }
  const recursiveFindBindingPaths = (formConfig: any) => {
    if (formConfig.children) {
      formConfig.children.forEach(recursiveFindBindingPaths);
    } else {
      const configPath = getDataTreeActionConfigPath(formConfig.configProperty);
      if (dynamicFields.includes(formConfig.controlType)) {
        if (!isHidden(action, formConfig.hidden)) {
          bindingPaths[configPath] = getCorrectEvaluationSubstitutionType(
            formConfig.evaluationSubstitutionType,
          );
        }
      } else if (formConfig.controlType === "ARRAY_FIELD") {
        let actionValue = _.get(action, formConfig.configProperty);
        if (Array.isArray(actionValue)) {
          actionValue = actionValue.filter((val) => val);
          for (let i = 0; i < actionValue.length; i++) {
            formConfig.schema.forEach((schemaField: any) => {
              if (
                schemaField.key in actionValue[i] &&
                dynamicFields.includes(schemaField.controlType)
              ) {
                const arrayConfigPath = `${configPath}[${i}].${schemaField.key}`;
                bindingPaths[
                  arrayConfigPath
                ] = getCorrectEvaluationSubstitutionType(
                  formConfig.evaluationSubstitutionType,
                );
              }
            });
          }
        }
      } else if (formConfig.controlType === "WHERE_CLAUSE") {
        const recursiveFindBindingPathsForWhereClause = (
          newConfigPath: string,
          actionValue: any,
        ) => {
          if (
            actionValue &&
            actionValue.hasOwnProperty("children") &&
            Array.isArray(actionValue.children)
          ) {
            actionValue.children.forEach((value: any, index: number) => {
              const childrenPath = getBindingOrConfigPathsForWhereClauseControl(
                newConfigPath,
                "children",
                index,
              );
              recursiveFindBindingPathsForWhereClause(childrenPath, value);
            });
          } else {
            if (actionValue.hasOwnProperty("key")) {
              const keyPath = getBindingOrConfigPathsForWhereClauseControl(
                newConfigPath,
                "key",
                undefined,
              );
              bindingPaths[keyPath] = getCorrectEvaluationSubstitutionType(
                formConfig.evaluationSubstitutionType,
              );
            }
            if (actionValue.hasOwnProperty("value")) {
              const valuePath = getBindingOrConfigPathsForWhereClauseControl(
                newConfigPath,
                "value",
                undefined,
              );
              bindingPaths[valuePath] = getCorrectEvaluationSubstitutionType(
                formConfig.evaluationSubstitutionType,
              );
            }
          }
        };

        const actionValue = _.get(action, formConfig.configProperty);
        if (
          actionValue &&
          actionValue.hasOwnProperty("children") &&
          Array.isArray(actionValue.children)
        ) {
          actionValue.children.forEach((value: any, index: number) => {
            const childrenPath = getBindingOrConfigPathsForWhereClauseControl(
              configPath,
              "children",
              index,
            );
            recursiveFindBindingPathsForWhereClause(childrenPath, value);
          });
        }
      } else if (formConfig.controlType === "PAGINATION") {
        const limitPath = getBindingOrConfigPathsForPaginationControl(
          "limit",
          formConfig.configProperty,
        );
        const offsetPath = getBindingOrConfigPathsForPaginationControl(
          "offset",
          formConfig.configProperty,
        );
        bindingPaths[limitPath] = getCorrectEvaluationSubstitutionType(
          formConfig.evaluationSubstitutionType,
        );
        bindingPaths[offsetPath] = getCorrectEvaluationSubstitutionType(
          formConfig.evaluationSubstitutionType,
        );
      } else if (formConfig.controlType === "SORTING") {
        const actionValue = _.get(action, formConfig.configProperty);
        if (Array.isArray(actionValue)) {
          actionValue.forEach((fieldConfig: any, index: number) => {
            const columnPath = getBindingOrConfigPathsForSortingControl(
              "column",
              formConfig.configProperty,
              index,
            );
            bindingPaths[columnPath] = getCorrectEvaluationSubstitutionType(
              formConfig.evaluationSubstitutionType,
            );
            const OrderPath = getBindingOrConfigPathsForSortingControl(
              "order",
              formConfig.configProperty,
              index,
            );
            bindingPaths[OrderPath] = getCorrectEvaluationSubstitutionType(
              formConfig.evaluationSubstitutionType,
            );
          });
        }
      } else if (formConfig.controlType === "ENTITY_SELECTOR") {
        if (Array.isArray(formConfig.schema)) {
          formConfig.schema.forEach((schemaField: any, index: number) => {
            if (allowedControlTypes.includes(schemaField.controlType)) {
              const columnPath = getBindingOrConfigPathsForEntitySelectorControl(
                formConfig.configProperty,
                index,
              );
              bindingPaths[columnPath] = getCorrectEvaluationSubstitutionType(
                formConfig.evaluationSubstitutionType,
              );
            }
          });
        }
      }
    }
  };
  formConfig.forEach(recursiveFindBindingPaths);
  return bindingPaths;
};

export const getBindingOrConfigPathsForSortingControl = (
  fieldName: "order" | "column",
  configProperty: string,
  index?: number,
): string => {
  const configPath = getDataTreeActionConfigPath(configProperty);
  if (_.isNumber(index)) {
    return `${configPath}[${index}].${fieldName}`;
  } else {
    return `${configPath}.${fieldName}`;
  }
};

export const getBindingOrConfigPathsForPaginationControl = (
  fieldName: "limit" | "offset",
  configProperty: string,
): string => {
  const configPath = getDataTreeActionConfigPath(configProperty);
  return `${configPath}.${fieldName}`;
};

export const getBindingOrConfigPathsForWhereClauseControl = (
  configPath: string,
  fieldName: "condition" | "key" | "children" | "value",
  index?: number,
): string => {
  if (fieldName === "children" && _.isNumber(index)) {
    return `${configPath}.${fieldName}[${index}]`;
  } else if (configPath && fieldName) {
    return `${configPath}.${fieldName}`;
  }
  return "";
};

export const getBindingOrConfigPathsForEntitySelectorControl = (
  configProperty: string,
  index: number,
): string => {
  const configPath = getDataTreeActionConfigPath(configProperty);
  return `${configPath}.column_${index + 1}`;
};

export const getDataTreeActionConfigPath = (propertyPath: string) =>
  propertyPath.replace("actionConfiguration.", "config.");
