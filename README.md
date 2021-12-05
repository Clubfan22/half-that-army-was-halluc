# Half that Army was Halluc

Simple script for faking WebEx meeting participants using guest credentials

## Prerequisites
Setup a guest issuing app at [this link](https://developer.webex.com/my-apps/new/guest-issuer) and note both the guest issuer id and the guest issuer secret.

## Usage
`half-that-army-was-halluc.sh` requires some configuration data, which is provided by environment variables:
* `GUEST_ISSUER_ID`: guest issuer id from WebEx app registration
* `GUEST_ISSUER_SECRET`: guest issuer secret from WebEx app registration
* `MEETING_URL`: url of meeting to join
* `NAMES_FILE`: path to file which contains the names of the fake users; for each line a new user is created

```shell
./half-that-army-was-halluc.sh
```

Instead of directly specifying these values as environment variables, you can also provide them in the `config` file, which then has to be sourced before script execution:
```shell
source config
./half-that-army-was-halluc.sh
```
