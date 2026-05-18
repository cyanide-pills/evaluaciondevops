FROM mysql:8.0

ENV MYSQL_ROOT_PASSWORD=root
ENV MYSQL_DATABASE=despacho_db
ENV MYSQL_USER=despacho_user
ENV MYSQL_PASSWORD=despacho_pass

# MySQL already runs as 'mysql' user (non-root)
# Ensure proper permissions for initialization script
COPY init.sql /docker-entrypoint-initdb.d/
RUN chown -R mysql:mysql /docker-entrypoint-initdb.d/

EXPOSE 3306

CMD ["mysqld"]
