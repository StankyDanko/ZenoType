# ZenoType — Server-Side AI Setup

Documentation for the remote Ollama inference endpoint that powers ZenoType's live demo on GitHub Pages.

## Architecture

```
GitHub Pages (stankydanko.github.io/ZenoType/)
    ↓ HTTPS (CORS-restricted)
Caddy reverse proxy (zenotype-api.southernsky.cloud)
    ↓ Docker network (localai_default)
Ollama container (ollama:11434)
    ↓
zenotype-backend model (qwen2.5:7b-instruct-q4_K_M)
```

## Server Details

| Detail | Value |
|--------|-------|
| **Host** | Reliable VPS (`104.243.45.247`) |
| **OS** | Ubuntu 24.04 LTS |
| **CPU** | Xeon E3-1230 v3 (no GPU — CPU inference only) |
| **Ollama** | Runs in Docker container on `localai_default` network |
| **Caddy** | Runs in Docker container on same network |
| **Domain** | `zenotype-api.southernsky.cloud` |
| **TLS** | Auto-provisioned by Caddy (Let's Encrypt) |

## Model: zenotype-backend

Custom Ollama model built from `qwen2.5:7b-instruct-q4_K_M` with a YAML system prompt tuned for continuous educational prose generation.

### Modelfile Location

- **Local (Zeus):** `/tmp/ZenoType-Backend-server.omf`
- **Original template:** `~/tools/agents/ZenoType-backend.omf` (llama3.2:3b base)

### Key Differences from Local Model

| Setting | Local (Zeus) | Server (Reliable) |
|---------|-------------|-------------------|
| Base model | `llama3.2:3b` | `qwen2.5:7b-instruct-q4_K_M` |
| Stop tokens | `<\|eot_id\|>`, `<\|start_header_id\|>` | `<\|im_end\|>`, `<\|im_start\|>` |
| Inference | GPU (RTX 3080 Ti) | CPU only (Xeon E3-1230 v3) |
| Speed | ~50+ tokens/sec | ~3-8 tokens/sec |

### Creating/Updating the Model

```bash
# SSH to server
ssh jmartin@104.243.45.247

# Copy modelfile to server (from Zeus)
scp /tmp/ZenoType-Backend-server.omf jmartin@104.243.45.247:/tmp/

# Create model inside Ollama container
sudo docker exec ollama ollama create zenotype-backend -f /tmp/ZenoType-Backend-server.omf

# Verify
sudo docker exec ollama ollama list
```

## Caddy Configuration

**File:** `/root/local-ai-packaged/caddy-addon/zenotype-api.conf`

```caddyfile
zenotype-api.southernsky.cloud {
    @preflight method OPTIONS
    handle @preflight {
        header Access-Control-Allow-Origin "https://stankydanko.github.io"
        header Access-Control-Allow-Methods "GET, POST, OPTIONS"
        header Access-Control-Allow-Headers "Content-Type"
        header Access-Control-Max-Age "86400"
        respond 204
    }
    header Access-Control-Allow-Origin "https://stankydanko.github.io"
    header Access-Control-Allow-Methods "GET, POST, OPTIONS"
    header Access-Control-Allow-Headers "Content-Type"
    reverse_proxy ollama:11434
}
```

### Key Points

- **CORS origin** is restricted to `https://stankydanko.github.io` — only the GitHub Pages deployment can call the API
- **`reverse_proxy ollama:11434`** uses Docker DNS (not `127.0.0.1`) because both Caddy and Ollama run as containers on the `localai_default` Docker network
- **TLS** is auto-provisioned by Caddy via Let's Encrypt
- **Rate limiting** is not currently enabled (requires `xcaddy` rebuild with `caddy-ratelimit` plugin). CORS origin restriction provides sufficient protection for a demo endpoint.

### Updating the Config

```bash
# Edit config
sudo nano /root/local-ai-packaged/caddy-addon/zenotype-api.conf

# Reload Caddy
sudo docker exec caddy caddy reload --config /etc/caddy/Caddyfile
```

## DNS

| Record | Type | Value |
|--------|------|-------|
| `zenotype-api.southernsky.cloud` | A | `104.243.45.247` |

Managed on Namecheap under `southernsky.cloud` domain.

## Testing

```bash
# Check models are available
curl https://zenotype-api.southernsky.cloud/api/tags

# Test CORS preflight
curl -I -X OPTIONS \
  -H "Origin: https://stankydanko.github.io" \
  https://zenotype-api.southernsky.cloud/api/generate

# Test generation (slow — CPU inference, expect 10-30 seconds)
curl -X POST https://zenotype-api.southernsky.cloud/api/generate \
  -H "Content-Type: application/json" \
  -d '{"model":"zenotype-backend","prompt":"topic: space exploration\ndifficulty_modifier: standard","stream":false}'
```

## Troubleshooting

### 502 Bad Gateway
Caddy can't reach Ollama. Check:
1. Ollama container is running: `sudo docker ps --filter name=ollama`
2. Both containers are on same network: `sudo docker network inspect localai_default`
3. Config uses `ollama:11434` (Docker DNS), not `127.0.0.1:11434`

### CORS Errors in Browser
1. Verify the `Access-Control-Allow-Origin` header matches exactly: `https://stankydanko.github.io`
2. Check Caddy config has both the preflight handler AND the global headers
3. Reload Caddy after config changes

### Slow Generation
Expected on CPU-only server. The 7B Q4_K_M model runs at ~3-8 tokens/sec on the Xeon E3-1230 v3. ZenoType's pre-fetch buffer (triggers at 40 words remaining) hides most of this latency during gameplay.

### Model Not Found
```bash
sudo docker exec ollama ollama list
# If zenotype-backend not listed, recreate it:
sudo docker exec ollama ollama create zenotype-backend -f /tmp/ZenoType-Backend-server.omf
```
