interface ZoneFlagsWindow extends Window {
  __Zone_disable_jasmine?: boolean;
}

(window as ZoneFlagsWindow).__Zone_disable_jasmine = true; // disable patch Jasmine