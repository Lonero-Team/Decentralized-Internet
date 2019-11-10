# Version 3.0.0 - 2018-02-11

- Feature: The MX record type is now supported.
- Breaking: The value of TXT records is now always an array of Buffers.
- Breaking: Renamed the `flag_trunc` and `flag_auth` to `flag_tc` and `flag_aa` to match the names of these in the dns standards.

# Version 2.0.0 - 2018-01-14

- Feature: The SOA record type is now supported.
- Feature: The NS record type is now supported.
- Feature: Added header flag properties.
- Breaking: Node.js 4.0.0 is now required.
- Breaking: The `class` option has been changed from integer to string.
