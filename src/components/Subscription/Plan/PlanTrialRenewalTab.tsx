import { Group, Input, NumberInput, SegmentedControl, Stack } from "@mantine/core";
import type { PlanForm, RenewalMode } from "../../../types/plan.types";

const TrialTab = ({ form }: { form: PlanForm }) => {
  const v = form.values;

  return (
    <Stack gap="lg">
      <Group align="flex-start" gap="lg">
        <Input.Wrapper label="Free Trial">
          <div>
            <SegmentedControl
              mt={4}
              value={v.freeTrial ? "yes" : "no"}
              onChange={(val) => form.setFieldValue("freeTrial", val === "yes")}
              data={[
                { value: "no", label: "No" },
                { value: "yes", label: "Yes" },
              ]}
            />
          </div>
        </Input.Wrapper>
        <NumberInput
          label="Trial Days"
          placeholder="e.g. 14"
          min={1}
          allowDecimal={false}
          disabled={!v.freeTrial}
          {...form.getInputProps("trialDays")}
        />
      </Group>

      <Group align="flex-start" gap="lg">
        <Input.Wrapper label="Billing Cycles">
          <div>
            <SegmentedControl
              mt={4}
              value={v.renewalMode}
              onChange={(val) => form.setFieldValue("renewalMode", val as RenewalMode)}
              data={[
                { value: "auto", label: "Auto-renew" },
                { value: "fixed", label: "Fixed cycles" },
              ]}
            />
          </div>
        </Input.Wrapper>
        <NumberInput
          label="Number of Cycles"
          placeholder="e.g. 12"
          min={1}
          allowDecimal={false}
          disabled={v.renewalMode !== "fixed"}
          {...form.getInputProps("cycles")}
        />
      </Group>
    </Stack>
  );
};

export default TrialTab;