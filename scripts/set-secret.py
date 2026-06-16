#!/usr/bin/env python3
"""
Canonical secret setter for WhosPlaying. NO TERMINAL REQUIRED.

  python3 scripts/set-secret.py STRIPE_SECRET_KEY

Claude runs this for you. Because Claude's tool shell has no TTY, the script
detects that and pops a NATIVE macOS dialog (masked field) on your screen — you
type the value there and click OK. The value goes straight into .env + Supabase
and never appears in chat, history, or any argument. (If you ever DO run it in a
real terminal yourself, it falls back to a getpass prompt automatically.)

What it does, in one step:
  1. Prompts for the value (hidden input via getpass).
  2. Validates the expected prefix where known (sk_, whsec_, etc.).
  3. Writes it into the gitignored supabase/functions/.env  (Layer-2 source of truth).
  4. Pushes it to the Supabase Edge Function Secrets store (supabase secrets set).
  5. Reminds you to record it in the vault + redeploy if the function reads it at startup.

Run it from the repo root. Requires the linked Supabase CLI on PATH.
"""
import getpass
import os
import subprocess
import sys

ENV_PATH = "supabase/functions/.env"

# Known prefixes — used only to catch obvious paste mistakes. Add as needed.
EXPECTED_PREFIX = {
    "STRIPE_SECRET_KEY": ("sk_test_", "sk_live_"),
    "STRIPE_WEBHOOK_SECRET": ("whsec_",),
    "SUPABASE_SERVICE_ROLE_KEY": ("eyJ", "sb_secret_"),
    "SUPABASE_SECRET_KEY": ("sb_secret_",),
    "RESEND_API_KEY": ("re_",),
}

# Functions that build a client at module load and therefore need a redeploy to
# pick up a changed value (warm isolates keep the old one until cold start).
NEEDS_REDEPLOY = {
    "STRIPE_SECRET_KEY": ["stripe-checkout", "stripe-portal"],
    "STRIPE_WEBHOOK_SECRET": [],  # stripe-webhook reads it per-request; no redeploy needed
}


def fail(msg):
    print(f"✗ {msg}")
    sys.exit(1)


def prompt_value(name):
    """Get the secret value WITHOUT a terminal.

    If a TTY exists (user ran this in their own terminal), use getpass.
    Otherwise — e.g. when Claude runs this via its tool shell, which has no TTY —
    pop a native macOS dialog with a masked field. Either way the value is read
    directly into this process and never printed, so it never reaches chat.
    """
    try:
        if sys.stdin.isatty():
            return getpass.getpass(f"Paste value for {name} (hidden): ").strip()
    except Exception:
        pass
    # No TTY -> native macOS masked dialog (GUI, no terminal involved).
    r = subprocess.run(
        ["osascript",
         "-e", (f'set r to display dialog "Enter value for {name}" '
                'default answer "" with hidden answer '
                'buttons {"Cancel", "OK"} default button "OK" '
                'with title "WhosPlaying Secret Entry"'),
         "-e", "return text returned of r"],
        capture_output=True, text=True)
    if r.returncode != 0:
        fail("dialog was cancelled or no display is available: "
             + (r.stderr.strip() or "unknown"))
    return r.stdout.strip()


def update_env(name, value):
    if not os.path.exists(ENV_PATH):
        fail(f"{ENV_PATH} not found — run from the repo root.")
    lines = open(ENV_PATH).read().splitlines()
    hit = False
    for i, ln in enumerate(lines):
        if ln.startswith(name + "="):
            lines[i] = f"{name}={value}"
            hit = True
    if not hit:
        lines.append(f"{name}={value}")
    open(ENV_PATH, "w").write("\n".join(lines) + "\n")
    return "updated" if hit else "added"


def main():
    if len(sys.argv) != 2:
        fail("usage: python3 scripts/set-secret.py <SECRET_NAME>")
    name = sys.argv[1]

    value = prompt_value(name)
    if not value:
        fail("empty — nothing changed.")

    prefixes = EXPECTED_PREFIX.get(name)
    if prefixes and not value.startswith(prefixes):
        fail(f"value doesn't start with one of {prefixes} — looks wrong, nothing changed.")

    action = update_env(name, value)
    print(f"✓ {ENV_PATH}: {name} {action}")

    print(f"→ pushing {name} to Supabase Edge Function Secrets ...")
    r = subprocess.run(["supabase", "secrets", "set", f"{name}={value}"],
                       capture_output=True, text=True)
    if r.returncode != 0:
        fail("supabase secrets set failed:\n" + (r.stderr or r.stdout))
    print("✓ pushed to Supabase")

    redeploy = NEEDS_REDEPLOY.get(name)
    if redeploy:
        print(f"\n⚠ Redeploy so the new value loads (these build a client at startup):")
        print(f"    supabase functions deploy {' '.join(redeploy)}")
    print(f"\nNext: record {name} + today's date in the vault:")
    print("    python3 ~/update_whosplaying_vault.py")


if __name__ == "__main__":
    main()
