#!/usr/bin/env bash

# https://stackoverflow.com/questions/296536/how-to-urlencode-data-for-curl-command
rawurlencode() {
  local string="${1}"
  local strlen=${#string}
  local encoded=""
  local pos c o

  for ((pos = 0; pos < strlen; pos++)); do
    c=${string:$pos:1}
    case "$c" in
    [-_.~a-zA-Z0-9]) o="${c}" ;;
    *) printf -v o '%%%02x' "'$c" ;;
    esac
    encoded+="${o}"
  done
  echo "${encoded}"  # You can either set a return variable (FASTER)
}

guest_issuer_id=$(rawurlencode "${GUEST_ISSUER_ID}")
guest_issuer_secret=$(rawurlencode "${GUEST_ISSUER_SECRET}")
meeting_url=$(rawurlencode "${MEETING_URL}")

filepath=$(realpath index.html)

while read username; do
  url="file://${filepath}?username=${username}&guest_issuer_id=${guest_issuer_id}&guest_issuer_secret=${guest_issuer_secret}&meeting_url=${meeting_url}"
  echo $url
  # profile_dir=$(mktemp -d -p tmp)
  # chromium --user-data-dir="${profile_dir}" --incognito --new-window "${url}" &
  firefox-nightly --private-window "${url}" &
  sleep 2
done <"${NAMES_FILE}"
