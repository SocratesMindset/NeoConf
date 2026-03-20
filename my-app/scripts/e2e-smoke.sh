#!/bin/bash
set -euo pipefail

base_url="${BASE_URL:-http://localhost:3000}"
workdir="${TMPDIR:-/tmp}/neoconf-smoke"
mkdir -p "$workdir"

suffix="$(date +%s)"
admin_cookie="$workdir/admin.cookies"
chair_cookie="$workdir/chair.cookies"
reviewer_cookie="$workdir/reviewer.cookies"
participant_cookie="$workdir/participant.cookies"
article_file="$workdir/article.pdf"

admin_email="admin-${suffix}@example.com"
chair_email="chair-${suffix}@example.com"
reviewer_email="reviewer-${suffix}@example.com"
participant_email="participant-${suffix}@example.com"

printf 'NeoConf smoke test article\n' > "$article_file"

post_json() {
  local cookie_file="$1"
  local path="$2"
  local payload="$3"
  shift 3

  curl -sS \
    -c "$cookie_file" \
    -b "$cookie_file" \
    -H 'Content-Type: application/json' \
    -d "$payload" \
    "$base_url$path"
}

read_json_field() {
  local field_path="$1"
  node -e '
    const fieldPath = process.argv[1].split(".");
    let body = "";
    process.stdin.on("data", (chunk) => {
      body += chunk;
    });
    process.stdin.on("end", () => {
      const data = JSON.parse(body);
      let current = data;
      for (const key of fieldPath) {
        current = current[key];
      }
      process.stdout.write(String(current));
    });
  ' "$field_path"
}

admin_json="$(post_json "$admin_cookie" "/api/auth/register" "{\"fullName\":\"Admin User\",\"email\":\"${admin_email}\",\"role\":\"admin\",\"password\":\"secret12\",\"confirmPassword\":\"secret12\",\"agreeWithPolicy\":true}")"
chair_json="$(post_json "$chair_cookie" "/api/auth/register" "{\"fullName\":\"Chair User\",\"email\":\"${chair_email}\",\"role\":\"section-chair\",\"password\":\"secret12\",\"confirmPassword\":\"secret12\",\"agreeWithPolicy\":true}")"
reviewer_json="$(post_json "$reviewer_cookie" "/api/auth/register" "{\"fullName\":\"Reviewer User\",\"email\":\"${reviewer_email}\",\"role\":\"reviewer\",\"password\":\"secret12\",\"confirmPassword\":\"secret12\",\"agreeWithPolicy\":true}")"
participant_json="$(post_json "$participant_cookie" "/api/auth/register" "{\"fullName\":\"Participant User\",\"email\":\"${participant_email}\",\"role\":\"participant\",\"password\":\"secret12\",\"confirmPassword\":\"secret12\",\"agreeWithPolicy\":true}")"

create_conf_json="$(post_json "$admin_cookie" "/api/conferences" "{\"name\":\"NeoConf QA ${suffix}\",\"city\":\"Казань\",\"startDate\":\"2026-06-01\"}")"
assign_rep_json="$(post_json "$admin_cookie" "/api/section-representatives" "{\"conferenceId\":\"seed-neoconf-2026\",\"sectionName\":\"Data Science\",\"representativeName\":\"Chair User\",\"representativeEmail\":\"${chair_email}\"}")"
registration_json="$(post_json "$participant_cookie" "/api/participant/registrations" "{\"conferenceId\":\"seed-neoconf-2026\"}")"

article_json="$(
  curl -sS \
    -c "$participant_cookie" \
    -b "$participant_cookie" \
    -F "conferenceId=seed-neoconf-2026" \
    -F "sectionName=Data Science" \
    -F "title=Smoke Test Article ${suffix}" \
    -F "abstract=End to end verification article" \
    -F "file=@${article_file};filename=article.pdf;type=application/pdf" \
    "$base_url/api/articles"
)"

article_id="$(printf '%s' "$article_json" | read_json_field "id")"

assignment_json="$(post_json "$chair_cookie" "/api/reviewer-assignments" "{\"articleId\":\"${article_id}\",\"reviewerName\":\"Reviewer User\",\"reviewerEmail\":\"${reviewer_email}\"}")"
review_json="$(post_json "$reviewer_cookie" "/api/reviews" "{\"articleId\":\"${article_id}\",\"score\":9,\"comment\":\"Smoke review ok\"}")"
me_json="$(curl -sS -b "$participant_cookie" "$base_url/api/auth/me")"
state_json="$(curl -sS "$base_url/api/app-state")"
download_status="$(curl -sS -o /dev/null -w '%{http_code}' "$base_url/api/articles/${article_id}/file")"
state_counts="$(printf '%s' "$state_json" | node -e 'let body=""; process.stdin.on("data", d => body += d); process.stdin.on("end", () => { const s = JSON.parse(body); process.stdout.write(JSON.stringify({ conferences: s.conferences.length, registrations: s.participantRegistrations.length, articles: s.articles.length, assignments: s.reviewerAssignments.length, reviews: s.reviews.length, sectionRepresentatives: s.sectionRepresentatives.length })); });')"

printf '%s\n' "$create_conf_json" | read_json_field "id" > "$workdir/conference_id.txt"

cat <<EOF
REGISTER_ADMIN=$admin_json
REGISTER_CHAIR=$chair_json
REGISTER_REVIEWER=$reviewer_json
REGISTER_PARTICIPANT=$participant_json
CREATE_CONFERENCE=$create_conf_json
ASSIGN_SECTION_REP=$assign_rep_json
REGISTER_TO_CONFERENCE=$registration_json
SUBMIT_ARTICLE=$article_json
ASSIGN_REVIEWER=$assignment_json
SUBMIT_REVIEW=$review_json
AUTH_ME=$me_json
DOWNLOAD_STATUS=$download_status
STATE_COUNTS=$state_counts
EOF
