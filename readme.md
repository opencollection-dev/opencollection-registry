## OpenCollection Registry

A web application for browsing and discovering API collections.

[Demo](https://registry-demo.opencollection.com) | [Official Docker Image](https://hub.docker.com/r/opencollection/registry)

### Docker Deployment

**Option 1: Mount a local registry file**

```bash
docker run
  --name opencollection-registry
  -p 3000:80
  -v $(pwd)/registry.yml:/registry.yml
  docker.io/opencollection/registry:latest
```

**Option 2: Fetch registry from a URL**

```bash
docker run
  --name opencollection-registry
  -p 3000:80
  -e REGISTRY_URL=https://example.com/registry.yml
  docker.io/opencollection/registry:latest
```

### Sample registry file

```yaml
collections:
  - name: gRPC-api-collection
    full_name: bruno-collections/gRPC-api-collection
    description: 'Explore gRPC APIs with this comprehensive collection of endpoints and examples.'
    versions:
      - name: latest
        url: https://github.com/bruno-collections/gRPC-api-collection
  - name: github-rest-api-collection
    full_name: bruno-collections/github-rest-api-collection
    description: 'Interact with GitHub repositories, issues, PRs, and more using this REST API collection.'
    versions:
      - name: latest
        url: https://github.com/bruno-collections/github-rest-api-collection
```

### License
[MIT License](license.md)

© Bruno Software Inc. 2025