# Configs

This document outlines the usage of configs within the platform.

## Overview

Configs are files that contain a single configuration value. They are read using the `read()` function from the `@tw050x.net.library/config` package. Read files are stored in an in memory cache for performance. The cache has a TTL of 5 minutes which is hardcoded into the library.

If the retrieved config value is stale then it will be reread from disk before beign returned. We do not implement state-white-revalidate or similar strategies at this time.

This feature is powered by the docker config feature of docker swarms. In local development we simply mount the `.configs/` directory as a volume in the service container. This has the same effect as mounting many docker configs into the container.

## Naming Convention

Configs should always have 3 segments separated by dots. The following is how each segment should be named. The length of a single segment can be any length but excessively long names should be avoided for readability.

#### 1. **Grouping**:

This is the first segment and should represent a broad grouping of related configs. A broad grouping should be conceptually high level in the repository.

> There should be a number of configs that need to be within this grouping. Or an expectation that more configs will be added to this grouping in the future. This is to avoid having many groupings with only a single config.

Approved groupings are:

- `cookie`
- `cors`
- `oauth2`
- `service`

#### 2. **Sub Grouping**:

This is the second segment and should represent a more specific grouping within the broad grouping. This should be conceptually lower level than the broad grouping. Additionally this segment can be replaced with a wildcard `*` if the config is applicable to all sub groupings within the broad grouping.

#### 3. **Config Name**:

This is the third segment and should represent the specific config being defined. This should be conceptually low level and very specific to the actual config value.
