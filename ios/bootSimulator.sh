# Get the uuid for an iphone X simulator
UUID=$(xcrun simctl list | grep "iPhone X " | grep -E -o -i "[0-9a-f]{8}-([0-9a-f]{4}-){3}[0-9a-f]{12}")

# Boot the simulator. Do not fail if the simulator is already booted
xcrun simctl boot $UUID || true

# Launch the actual simulator app
open -a Simulator.app || true
