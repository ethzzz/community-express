{{- define "community.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "community.image" -}}
{{- $registry := .Values.global.imageRegistry -}}
{{- if $registry -}}
{{- printf "%s/%s:%s" $registry .image.repository .image.tag -}}
{{- else -}}
{{- printf "%s:%s" .image.repository .image.tag -}}
{{- end -}}
{{- end -}}

{{- define "community.databaseUrl" -}}
{{- printf "mysql://%s:%s@%s:%v/%s" .Values.mysql.username .Values.mysql.password .Values.mysql.host .Values.mysql.port .Values.mysql.database -}}
{{- end -}}

{{- define "community.adminDatabaseUrl" -}}
{{- printf "mysql://%s:%s@%s:%v/%s" .Values.mysql.username .Values.mysql.password .Values.mysql.host .Values.mysql.port .Values.mysql.adminDatabase -}}
{{- end -}}

{{- define "community.redisUrl" -}}
{{- printf "redis://%s:%v" .Values.redis.host .Values.redis.port -}}
{{- end -}}

{{- define "community.secretName" -}}
{{- if .Values.secrets.existingSecret -}}
{{- .Values.secrets.existingSecret -}}
{{- else -}}
{{- printf "%s-secrets" (include "community.name" .) -}}
{{- end -}}
{{- end -}}
