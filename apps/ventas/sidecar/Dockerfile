FROM envoyproxy/envoy:v1.31-latest

# Install envsubst (gettext) to substitute env vars into the config template
RUN apt-get update && \
    apt-get install -y --no-install-recommends gettext-base && \
    rm -rf /var/lib/apt/lists/*

# Envoy config template — upstream address is resolved at container start
COPY envoy.yaml.tmpl /etc/envoy/envoy.yaml.tmpl

# Startup script: renders the template and launches Envoy
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# 10000 — proxy port (ventas calls this)
# 9901  — Envoy admin (metrics / health: GET /ready, GET /stats)
EXPOSE 10000 9901

ENTRYPOINT ["/entrypoint.sh"]
