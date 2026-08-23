type GoogleCredentialResponse = {
  credential?: string;
  select_by?: string;
};

type GoogleIdConfiguration = {
  client_id: string;
  callback: (response: GoogleCredentialResponse) => void;
  nonce: string;
  auto_select?: boolean;
  button_auto_select?: boolean;
  cancel_on_tap_outside?: boolean;
  context?: "signin" | "signup" | "use";
  ux_mode?: "popup" | "redirect";
};

type GoogleButtonConfiguration = {
  type: "standard" | "icon";
  theme?: "outline" | "filled_blue" | "filled_black";
  size?: "small" | "medium" | "large";
  text?: "signin_with" | "signup_with" | "continue_with" | "signin";
  shape?: "rectangular" | "pill" | "circle" | "square";
  logo_alignment?: "left" | "center";
  width?: number;
  locale?: string;
};

type GoogleIdentityServices = {
  accounts: {
    id: {
      initialize: (configuration: GoogleIdConfiguration) => void;
      renderButton: (parent: HTMLElement, configuration: GoogleButtonConfiguration) => void;
      disableAutoSelect: () => void;
      cancel: () => void;
    };
  };
};

interface Window {
  google?: GoogleIdentityServices;
}
