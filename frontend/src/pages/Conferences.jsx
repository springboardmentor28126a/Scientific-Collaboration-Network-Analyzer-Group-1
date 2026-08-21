import {
  useEffect,
  useMemo,
  useState,
} from "react";

import AppShell from "../components/AppShell";

import {
  CalendarDays,
  Clock3,
  ExternalLink,
  Globe2,
  MapPin,
  Presentation,
  Search,
  Trash2,
  Users,
  Plus,
  X,
} from "lucide-react";

import {
  getConferences,
  createConference,
  deleteConference,
  registerConferenceParticipation,
  removeConferenceParticipation,
} from "../api/conferences";

import { getResearchers } from "../api/researchers";

import "./Conferences.css";


export default function Conferences() {

  const [conferences, setConferences] =
    useState([]);

  const [researchers, setResearchers] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [filter, setFilter] =
    useState("all");

  const [showCreateForm, setShowCreateForm] =
    useState(true);

  const [form, setForm] = useState({
    name: "",
    acronym: "",
    year: new Date().getFullYear(),
    location: "",
    website: "",
    start_date: "",
    end_date: "",
  });

  const [registerForms, setRegisterForms] =
    useState({});


  /* =========================================================
     LOAD DATA
     ========================================================= */

  const loadData = async () => {

    setLoading(true);
    setError("");

    /*
     * Conferences and researchers are loaded
     * independently.
     *
     * If researchers fail to load, the existing
     * conferences from PostgreSQL will STILL appear.
     */

    try {

      const confRes =
        await getConferences();

      console.log(
        "CONFERENCES API RESPONSE:",
        confRes.data
      );

      const conferenceData =
        Array.isArray(confRes.data)
          ? confRes.data
          : Array.isArray(
              confRes.data?.items
            )
          ? confRes.data.items
          : Array.isArray(
              confRes.data?.data
            )
          ? confRes.data.data
          : [];

      setConferences(
        conferenceData
      );

    } catch (err) {

      console.error(
        "CONFERENCES LOAD ERROR:",
        err.response?.data || err
      );

      setConferences([]);

      setError(
        err.response?.data?.detail ||
          "Unable to load conference information."
      );
    }


    /*
     * Researchers are deliberately loaded separately.
     */

    try {

      const resRes =
        await getResearchers();

      console.log(
        "RESEARCHERS API RESPONSE:",
        resRes.data
      );

      const researcherData =
        Array.isArray(resRes.data)
          ? resRes.data
          : Array.isArray(
              resRes.data?.items
            )
          ? resRes.data.items
          : Array.isArray(
              resRes.data?.data
            )
          ? resRes.data.data
          : [];

      setResearchers(
        researcherData
      );

    } catch (err) {

      console.error(
        "RESEARCHERS LOAD ERROR:",
        err.response?.data || err
      );

      /*
       * Researchers can be empty without
       * removing the conferences.
       */

      setResearchers([]);
    }

    setLoading(false);
  };


  /* =========================================================
     INITIAL LOAD
     ========================================================= */

  useEffect(() => {
    loadData();
  }, []);


  /* =========================================================
     FORM HANDLING
     ========================================================= */

  const handleFormChange = (e) => {

    setForm({
      ...form,
      [e.target.name]:
        e.target.value,
    });
  };


  const resetForm = () => {

    setForm({
      name: "",
      acronym: "",
      year: new Date().getFullYear(),
      location: "",
      website: "",
      start_date: "",
      end_date: "",
    });
  };


  /* =========================================================
     CREATE
     ========================================================= */

  const handleCreate = async (e) => {

    e.preventDefault();

    setSubmitting(true);
    setError("");

    try {

      const payload = {
        ...form,

        year:
          form.year
            ? parseInt(
                form.year,
                10
              )
            : null,

        start_date:
          form.start_date || null,

        end_date:
          form.end_date || null,
      };

      await createConference(
        payload
      );

      resetForm();

      await loadData();

    } catch (err) {

      console.error(
        "CREATE CONFERENCE ERROR:",
        err.response?.data || err
      );

      const detail =
        err.response?.data?.detail;

      if (Array.isArray(detail)) {

        setError(
          detail
            .map((item) => {

              const field =
                Array.isArray(item.loc)
                  ? item.loc.join(" → ")
                  : "field";

              return `${field}: ${item.msg}`;
            })
            .join(" | ")
        );

      } else {

        setError(
          typeof detail === "string"
            ? detail
            : "Failed to create the conference."
        );
      }

    } finally {

      setSubmitting(false);
    }
  };


  /* =========================================================
     DELETE
     ========================================================= */

  const handleDelete = async (id) => {

    const confirmed =
      window.confirm(
        "Are you sure you want to permanently delete this conference?"
      );

    if (!confirmed) {
      return;
    }

    try {

      await deleteConference(id);

      await loadData();

    } catch (err) {

      console.error(
        "DELETE CONFERENCE ERROR:",
        err.response?.data || err
      );

      setError(
        err.response?.data?.detail ||
          "Failed to delete conference."
      );
    }
  };


  /* =========================================================
     PARTICIPATION / PRESENTATION
     ========================================================= */

  const handleRegisterChange = (
    confId,
    field,
    value
  ) => {

    setRegisterForms(
      (previous) => ({
        ...previous,

        [confId]: {
          ...previous[confId],

          [field]: value,
        },
      })
    );
  };


  const handleRegister = async (
    e,
    confId
  ) => {

    e.preventDefault();

    const regForm =
      registerForms[confId];

    if (!regForm?.researcher_id) {

      alert(
        "Please select a researcher."
      );

      return;
    }


    const isPresentation =
      regForm.role === "Presenter" ||
      regForm.role === "Keynote Speaker";


    if (
      isPresentation &&
      !regForm.paper_title?.trim()
    ) {

      alert(
        "Please enter the presentation title."
      );

      return;
    }


    if (
      isPresentation &&
      !regForm.presentation_time
    ) {

      alert(
        "Please select the presentation date and time."
      );

      return;
    }


    try {

      await registerConferenceParticipation(
        confId,
        {
          researcher_id:
            parseInt(
              regForm.researcher_id,
              10
            ),

          role:
            regForm.role ||
            "Attendee",

          paper_title:
            regForm.paper_title?.trim()
              ? regForm.paper_title.trim()
              : null,

          presentation_time:
            regForm.presentation_time
              ? new Date(
                  regForm.presentation_time
                ).toISOString()
              : null,
        }
      );


      setRegisterForms(
        (previous) => ({
          ...previous,

          [confId]: {
            researcher_id: "",
            role: "Attendee",
            paper_title: "",
            presentation_time: "",
          },
        })
      );


      await loadData();

    } catch (err) {

      console.error(
        "REGISTER PARTICIPATION ERROR:",
        err.response?.data || err
      );

      alert(
        err.response?.data?.detail ||
          "Failed to register participation."
      );
    }
  };


  const handleRemoveParticipation = async (
    confId,
    researcherId
  ) => {

    const confirmed =
      window.confirm(
        "Cancel this researcher's conference registration?"
      );

    if (!confirmed) {
      return;
    }

    try {

      await removeConferenceParticipation(
        confId,
        researcherId
      );

      await loadData();

    } catch (err) {

      console.error(
        "REMOVE PARTICIPATION ERROR:",
        err.response?.data || err
      );

      alert(
        err.response?.data?.detail ||
          "Failed to cancel registration."
      );
    }
  };


  /* =========================================================
     HELPERS
     ========================================================= */

  const getResearcherName = (id) => {

    const researcher =
      researchers.find(
        (r) =>
          Number(r.id) ===
          Number(id)
      );

    return researcher
      ? researcher.full_name ||
          researcher.name ||
          `Researcher #${id}`
      : `Researcher #${id}`;
  };


  const getConferenceState = (
    conference
  ) => {

    if (!conference.start_date) {
      return "scheduled";
    }

    const today =
      new Date();

    const start =
      new Date(
        `${conference.start_date}T00:00:00`
      );

    const end =
      conference.end_date
        ? new Date(
            `${conference.end_date}T23:59:59`
          )
        : start;


    if (today < start) {
      return "upcoming";
    }


    if (today > end) {
      return "past";
    }


    return "ongoing";
  };


  const formatDate = (date) => {

    if (!date) {
      return "Date not announced";
    }

    return new Date(
      `${date}T00:00:00`
    ).toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
      }
    );
  };


  const getDateRange = (
    conference
  ) => {

    if (
      !conference.start_date &&
      !conference.end_date
    ) {

      return "Dates to be announced";
    }


    if (
      conference.start_date &&
      conference.end_date &&
      conference.start_date !==
        conference.end_date
    ) {

      return `${formatDate(
        conference.start_date
      )} — ${formatDate(
        conference.end_date
      )}`;
    }


    return formatDate(
      conference.start_date ||
        conference.end_date
    );
  };


  /*
   * Format presentation date/time
   */

  const formatPresentationTime = (
    value
  ) => {

    if (!value) {
      return "";
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "";
    }

    return date.toLocaleString(
      "en-US",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }
    );
  };


  /* =========================================================
     FILTERING
     ========================================================= */

  const filteredConferences =
    useMemo(() => {

      return conferences.filter(
        (conference) => {

          const state =
            getConferenceState(
              conference
            );


          const matchesFilter =
            filter === "all" ||
            (
              filter === "upcoming" &&
              state === "upcoming"
            ) ||
            (
              filter === "ongoing" &&
              state === "ongoing"
            ) ||
            (
              filter === "past" &&
              state === "past"
            );


          const searchText =
            search
              .trim()
              .toLowerCase();


          const matchesSearch =
            !searchText ||
            conference.name
              ?.toLowerCase()
              .includes(searchText) ||
            conference.acronym
              ?.toLowerCase()
              .includes(searchText) ||
            conference.location
              ?.toLowerCase()
              .includes(searchText);


          return (
            matchesFilter &&
            matchesSearch
          );
        }
      );

    }, [
      conferences,
      search,
      filter,
    ]);


  /* =========================================================
     STATISTICS
     ========================================================= */

  const upcomingCount =
    conferences.filter(
      (conference) =>
        getConferenceState(
          conference
        ) === "upcoming"
    ).length;


  const ongoingCount =
    conferences.filter(
      (conference) =>
        getConferenceState(
          conference
        ) === "ongoing"
    ).length;


  const participantCount =
    conferences.reduce(
      (
        total,
        conference
      ) =>
        total +
        (
          conference.participations
            ?.length || 0
        ),
      0
    );


  const presentationCount =
    conferences.reduce(
      (
        total,
        conference
      ) =>
        total +
        (
          conference.participations
            ?.filter(
              (part) =>
                part.role === "Presenter" ||
                part.role === "Keynote Speaker"
            )
            .length || 0
        ),
      0
    );


  /* =========================================================
     RENDER
     ========================================================= */

  return (
    <AppShell>

      <main className="conf-page">

        {/* =================================================
            HERO
            ================================================= */}

        <section className="conf-hero">

          <div className="conf-hero-main">

            <div className="conf-eyebrow">

              <span className="conf-badge">
                Scientific Exchange
              </span>

              <span className="conf-date-label">
                Research Events
              </span>

            </div>


            <p className="conf-kicker">
              Conference & Academic Events
            </p>


            <h1 className="conf-title">
              Research Conferences
              <span>.</span>
            </h1>


            <p className="conf-subtitle">
              Discover scientific events,
              coordinate researcher
              participation, and maintain
              a structured record of
              academic presentations and
              conference activity.
            </p>


            <div className="conf-hero-actions">

              <button
                className="conf-primary-button"
                onClick={() =>
                  setShowCreateForm(true)
                }
              >
                <Plus size={16} />
                Add Conference
              </button>


              <button
                className="conf-secondary-button"
                onClick={() => {

                  setFilter("upcoming");

                  window.scrollTo({
                    top: 500,
                    behavior: "smooth",
                  });

                }}
              >
                <CalendarDays size={16} />
                View Upcoming
              </button>

            </div>

          </div>


          <div className="conf-hero-panel">

            <div className="conf-hero-icon">
              <Presentation size={23} />
            </div>

            <span>
              EVENT NETWORK
            </span>

            <strong>
              {conferences.length}
            </strong>

            <small>
              conferences currently tracked
            </small>

          </div>

        </section>


        {/* =================================================
            STATISTICS
            ================================================= */}

        <section className="conf-section">

          <div className="conf-section-heading">

            <div>

              <span className="conf-section-label">
                EVENT OVERVIEW
              </span>

              <h2>
                Conference activity
              </h2>

            </div>


            <span className="conf-section-caption">
              Live data from the research network
            </span>

          </div>


          <div className="conf-stats-grid">

            <div className="conf-stat-card">

              <div className="conf-stat-icon">
                <Globe2 size={19} />
              </div>

              <div>

                <span>
                  Total Events
                </span>

                <strong>
                  {conferences.length}
                </strong>

                <small>
                  Conferences registered
                </small>

              </div>

            </div>


            <div className="conf-stat-card">

              <div className="conf-stat-icon">
                <CalendarDays size={19} />
              </div>

              <div>

                <span>
                  Upcoming
                </span>

                <strong>
                  {upcomingCount}
                </strong>

                <small>
                  Future scientific events
                </small>

              </div>

            </div>


            <div className="conf-stat-card">

              <div className="conf-stat-icon">
                <Clock3 size={19} />
              </div>

              <div>

                <span>
                  Ongoing
                </span>

                <strong>
                  {ongoingCount}
                </strong>

                <small>
                  Events happening now
                </small>

              </div>

            </div>


            <div className="conf-stat-card">

              <div className="conf-stat-icon">
                <Users size={19} />
              </div>

              <div>

                <span>
                  Participation
                </span>

                <strong>
                  {participantCount}
                </strong>

                <small>
                  Registered researcher entries
                </small>

              </div>

            </div>


            <div className="conf-stat-card">

              <div className="conf-stat-icon">
                <Presentation size={19} />
              </div>

              <div>

                <span>
                  Presentations
                </span>

                <strong>
                  {presentationCount}
                </strong>

                <small>
                  Presenter & keynote records
                </small>

              </div>

            </div>

          </div>

        </section>


        {/* =================================================
            CREATE CONFERENCE
            ================================================= */}

        <section className="conf-section">

          <div className="conf-section-heading">

            <div>

              <span className="conf-section-label">
                EVENT MANAGEMENT
              </span>

              <h2>
                Create a conference
              </h2>

            </div>


            <button
              className="conf-collapse-button"
              onClick={() =>
                setShowCreateForm(
                  !showCreateForm
                )
              }
            >

              {showCreateForm ? (
                <>
                  <X size={15} />
                  Close
                </>
              ) : (
                <>
                  <Plus size={15} />
                  New Conference
                </>
              )}

            </button>

          </div>


          {showCreateForm && (

            <form
              onSubmit={handleCreate}
              className="conf-form"
            >

              <div className="conf-form-intro">

                <div className="conf-form-number">
                  01
                </div>

                <div>

                  <strong>
                    Event information
                  </strong>

                  <p>
                    Add the basic details of
                    the scientific conference
                    or academic event.
                  </p>

                </div>

              </div>


              <div className="conf-field-grid">

                <div className="conf-field conf-field-wide">

                  <label>
                    Conference name
                  </label>

                  <input
                    name="name"
                    placeholder="e.g. International Research & Innovation Forum"
                    value={form.name}
                    onChange={
                      handleFormChange
                    }
                    required
                    className="conf-input"
                  />

                </div>


                <div className="conf-field">

                  <label>
                    Acronym
                  </label>

                  <input
                    name="acronym"
                    placeholder="e.g. IRIF"
                    value={form.acronym}
                    onChange={
                      handleFormChange
                    }
                    className="conf-input"
                  />

                </div>


                <div className="conf-field">

                  <label>
                    Year
                  </label>

                  <input
                    name="year"
                    type="number"
                    min="2000"
                    max="2100"
                    value={form.year}
                    onChange={
                      handleFormChange
                    }
                    className="conf-input"
                  />

                </div>


                <div className="conf-field conf-field-wide">

                  <label>
                    Location
                  </label>

                  <input
                    name="location"
                    placeholder="City, Country or Online"
                    value={form.location}
                    onChange={
                      handleFormChange
                    }
                    className="conf-input"
                  />

                </div>


                <div className="conf-field conf-field-wide">

                  <label>
                    Official website
                  </label>

                  <input
                    name="website"
                    placeholder="https://conference.example"
                    value={form.website}
                    onChange={
                      handleFormChange
                    }
                    className="conf-input"
                  />

                </div>


                <div className="conf-field">

                  <label>
                    Start date
                  </label>

                  <input
                    name="start_date"
                    type="date"
                    value={
                      form.start_date
                    }
                    onChange={
                      handleFormChange
                    }
                    className="conf-input"
                  />

                </div>


                <div className="conf-field">

                  <label>
                    End date
                  </label>

                  <input
                    name="end_date"
                    type="date"
                    value={
                      form.end_date
                    }
                    onChange={
                      handleFormChange
                    }
                    className="conf-input"
                  />

                </div>

              </div>


              {error && (
                <div className="conf-error">
                  {error}
                </div>
              )}


              <div className="conf-form-footer">

                <p>
                  Conference records can later
                  be connected with researchers
                  and presentations.
                </p>


                <button
                  type="submit"
                  disabled={submitting}
                  className="conf-primary-button"
                >

                  <Plus size={16} />

                  {submitting
                    ? "Creating..."
                    : "Create Conference"}

                </button>

              </div>

            </form>

          )}

        </section>


        {/* =================================================
            SEARCH / FILTER
            ================================================= */}

        <section className="conf-toolbar">

          <div className="conf-search">

            <Search size={17} />

            <input
              type="text"
              placeholder="Search conferences, acronyms or locations..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
            />

          </div>


          <div className="conf-filters">

            <button
              className={
                filter === "all"
                  ? "conf-filter active"
                  : "conf-filter"
              }
              onClick={() =>
                setFilter("all")
              }
            >
              All
            </button>


            <button
              className={
                filter === "upcoming"
                  ? "conf-filter active"
                  : "conf-filter"
              }
              onClick={() =>
                setFilter("upcoming")
              }
            >
              Upcoming
            </button>


            <button
              className={
                filter === "ongoing"
                  ? "conf-filter active"
                  : "conf-filter"
              }
              onClick={() =>
                setFilter("ongoing")
              }
            >
              Ongoing
            </button>


            <button
              className={
                filter === "past"
                  ? "conf-filter active"
                  : "conf-filter"
              }
              onClick={() =>
                setFilter("past")
              }
            >
              Past
            </button>

          </div>

        </section>


        {/* =================================================
            CONFERENCE LIST
            ================================================= */}

        <section className="conf-section">

          <div className="conf-section-heading">

            <div>

              <span className="conf-section-label">
                CONFERENCE DIRECTORY
              </span>

              <h2>
                Research events
              </h2>

            </div>


            <span className="conf-result-count">
              {filteredConferences.length} events
            </span>

          </div>


          {loading ? (

            <div className="conf-loading">

              <div className="conf-spinner" />

              <span>
                Loading conference network...
              </span>

            </div>

          ) : filteredConferences.length === 0 ? (

            <div className="conf-empty">

              <div className="conf-empty-icon">
                <Search size={21} />
              </div>

              <strong>
                No conferences found
              </strong>

              <p>
                Try changing your search
                or filter, or create a
                new conference.
              </p>

            </div>

          ) : (

            <div className="conf-list">

              {filteredConferences.map(
                (conf) => {

                  const state =
                    getConferenceState(
                      conf
                    );


                  const participationCount =
                    conf.participations
                      ?.length || 0;


                  const conferencePresentations =
                    conf.participations?.filter(
                      (part) =>
                        part.role ===
                          "Presenter" ||
                        part.role ===
                          "Keynote Speaker"
                    ) || [];


                  return (

                    <article
                      key={conf.id}
                      className="conf-card"
                    >

                      {/* CARD HEADER */}

                      <div className="conf-card-top">

                        <div className="conf-card-identity">

                          <div className="conf-acronym">

                            {conf.acronym
                              ? conf.acronym
                                  .slice(
                                    0,
                                    5
                                  )
                                  .toUpperCase()
                              : "CONF"}

                          </div>


                          <div>

                            <div className="conf-status-row">

                              <span
                                className={`conf-status conf-status--${state}`}
                              >

                                <span />

                                {state ===
                                "upcoming"
                                  ? "Upcoming"
                                  : state ===
                                    "ongoing"
                                  ? "Ongoing"
                                  : state ===
                                    "past"
                                  ? "Completed"
                                  : "Scheduled"}

                              </span>


                              {conf.year && (

                                <span className="conf-year">
                                  {conf.year}
                                </span>

                              )}

                            </div>


                            <h3>
                              {conf.name}
                            </h3>

                          </div>

                        </div>


                        <button
                          className="conf-delete-icon"
                          onClick={() =>
                            handleDelete(
                              conf.id
                            )
                          }
                          title="Delete conference"
                          aria-label="Delete conference"
                        >
                          <Trash2 size={16} />
                        </button>

                      </div>


                      {/* DETAILS */}

                      <div className="conf-details-grid">

                        <div className="conf-detail">

                          <CalendarDays size={16} />

                          <div>

                            <span>
                              EVENT DATES
                            </span>

                            <strong>
                              {getDateRange(
                                conf
                              )}
                            </strong>

                          </div>

                        </div>


                        <div className="conf-detail">

                          <MapPin size={16} />

                          <div>

                            <span>
                              LOCATION
                            </span>

                            <strong>
                              {conf.location ||
                                "Online / Not specified"}
                            </strong>

                          </div>

                        </div>


                        <div className="conf-detail">

                          <Users size={16} />

                          <div>

                            <span>
                              PARTICIPANTS
                            </span>

                            <strong>
                              {participationCount}{" "}
                              researcher
                              {participationCount !==
                              1
                                ? "s"
                                : ""}
                            </strong>

                          </div>

                        </div>

                      </div>


                      {/* WEBSITE */}

                      {conf.website && (

                        <div className="conf-website">

                          <Globe2 size={15} />

                          <span>
                            Official event website
                          </span>

                          <a
                            href={
                              conf.website
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Visit website
                            <ExternalLink
                              size={13}
                            />
                          </a>

                        </div>

                      )}


                      {/* PARTICIPATION */}

                      <div className="conf-participations-section">

                        <div className="conf-participation-header">

                          <div>

                            <span className="conf-section-label">
                              RESEARCH NETWORK
                            </span>

                            <h4>
                              Attendees &
                              Presenters
                            </h4>

                          </div>


                          <span className="conf-participant-count">
                            {participationCount}
                          </span>

                        </div>


                        <div className="conf-parts-list">

                          {participationCount ===
                          0 ? (

                            <div className="conf-no-participants">
                              No researcher
                              participation
                              registered yet.
                            </div>

                          ) : (

                            conf.participations.map(
                              (part) => (

                                <div
                                  key={part.id}
                                  className="conf-part-row"
                                >

                                  <div className="conf-part-avatar">

                                    {getResearcherName(
                                      part.researcher_id
                                    )
                                      .charAt(
                                        0
                                      )
                                      .toUpperCase()}

                                  </div>


                                  <div className="conf-part-details">

                                    <strong>
                                      {getResearcherName(
                                        part.researcher_id
                                      )}
                                    </strong>


                                    <span>
                                      {part.role}
                                    </span>


                                    {part.paper_title && (

                                      <small>
                                        Presentation:
                                        {" "}
                                        {
                                          part.paper_title
                                        }
                                      </small>

                                    )}


                                    {part.presentation_time && (

                                      <small>
                                        <Clock3
                                          size={12}
                                          style={{
                                            verticalAlign:
                                              "middle",
                                            marginRight:
                                              "4px",
                                          }}
                                        />

                                        {formatPresentationTime(
                                          part.presentation_time
                                        )}
                                      </small>

                                    )}

                                  </div>


                                  <button
                                    className="conf-remove-part-btn"
                                    onClick={() =>
                                      handleRemoveParticipation(
                                        conf.id,
                                        part.researcher_id
                                      )
                                    }
                                  >
                                    Remove
                                  </button>

                                </div>

                              )
                            )

                          )}

                        </div>


                        {/* PRESENTATION SUMMARY */}

                        {conferencePresentations.length >
                          0 && (

                          <div
                            style={{
                              marginTop:
                                "18px",
                              paddingTop:
                                "16px",
                              borderTop:
                                "1px solid rgba(255,255,255,0.07)",
                            }}
                          >

                            <div
                              style={{
                                display:
                                  "flex",
                                alignItems:
                                  "center",
                                gap:
                                  "8px",
                                marginBottom:
                                  "10px",
                              }}
                            >

                              <Presentation
                                size={15}
                              />

                              <strong>
                                Presentation Records
                              </strong>

                              <span>
                                ({conferencePresentations.length})
                              </span>

                            </div>


                            <div
                              style={{
                                display:
                                  "flex",
                                flexDirection:
                                  "column",
                                gap:
                                  "8px",
                              }}
                            >

                              {conferencePresentations.map(
                                (presentation) => (

                                  <div
                                    key={
                                      `presentation-${presentation.id}`
                                    }
                                    style={{
                                      padding:
                                        "10px 12px",
                                      borderRadius:
                                        "8px",
                                      background:
                                        "rgba(255,255,255,0.025)",
                                      border:
                                        "1px solid rgba(255,255,255,0.06)",
                                    }}
                                  >

                                    <strong
                                      style={{
                                        display:
                                          "block",
                                        marginBottom:
                                          "4px",
                                      }}
                                    >
                                      {
                                        presentation.paper_title
                                      }
                                    </strong>


                                    <span
                                      style={{
                                        display:
                                          "block",
                                        fontSize:
                                          "0.78rem",
                                        opacity:
                                          0.72,
                                      }}
                                    >
                                      {
                                        getResearcherName(
                                          presentation.researcher_id
                                        )
                                      }
                                      {" • "}
                                      {
                                        presentation.role
                                      }
                                    </span>


                                    {presentation.presentation_time && (

                                      <span
                                        style={{
                                          display:
                                            "block",
                                          marginTop:
                                            "4px",
                                          fontSize:
                                            "0.75rem",
                                          opacity:
                                            0.65,
                                        }}
                                      >
                                        <Clock3
                                          size={12}
                                          style={{
                                            verticalAlign:
                                              "middle",
                                            marginRight:
                                              "4px",
                                          }}
                                        />

                                        {
                                          formatPresentationTime(
                                            presentation.presentation_time
                                          )
                                        }
                                      </span>

                                    )}

                                  </div>

                                )
                              )}

                            </div>

                          </div>

                        )}


                        {/* REGISTER */}

                        <form
                          onSubmit={(e) =>
                            handleRegister(
                              e,
                              conf.id
                            )
                          }
                          className="conf-register-form"
                        >

                          <select
                            value={
                              registerForms[
                                conf.id
                              ]?.researcher_id ||
                              ""
                            }
                            onChange={(e) =>
                              handleRegisterChange(
                                conf.id,
                                "researcher_id",
                                e.target.value
                              )
                            }
                            className="conf-register-input"
                            required
                          >

                            <option value="">
                              Select researcher
                            </option>


                            {researchers.map(
                              (researcher) => (

                                <option
                                  key={
                                    researcher.id
                                  }
                                  value={
                                    researcher.id
                                  }
                                >
                                  {
                                    researcher.full_name ||
                                    researcher.name ||
                                    `Researcher #${researcher.id}`
                                  }
                                </option>

                              )
                            )}

                          </select>


                          <select
                            value={
                              registerForms[
                                conf.id
                              ]?.role ||
                              "Attendee"
                            }
                            onChange={(e) =>
                              handleRegisterChange(
                                conf.id,
                                "role",
                                e.target.value
                              )
                            }
                            className="conf-register-input"
                          >

                            <option value="Attendee">
                              Attendee
                            </option>

                            <option value="Presenter">
                              Presenter
                            </option>

                            <option value="Keynote Speaker">
                              Keynote Speaker
                            </option>

                          </select>


                          <input
                            placeholder={
                              (
                                registerForms[
                                  conf.id
                                ]?.role ===
                                  "Presenter" ||
                                registerForms[
                                  conf.id
                                ]?.role ===
                                  "Keynote Speaker"
                              )
                                ? "Presentation title"
                                : "Paper title (optional)"
                            }
                            value={
                              registerForms[
                                conf.id
                              ]?.paper_title ||
                              ""
                            }
                            onChange={(e) =>
                              handleRegisterChange(
                                conf.id,
                                "paper_title",
                                e.target.value
                              )
                            }
                            className="conf-register-input conf-paper-input"
                            required={
                              registerForms[
                                conf.id
                              ]?.role ===
                                "Presenter" ||
                              registerForms[
                                conf.id
                              ]?.role ===
                                "Keynote Speaker"
                            }
                          />


                          <input
                            type="datetime-local"
                            value={
                              registerForms[
                                conf.id
                              ]?.presentation_time ||
                              ""
                            }
                            onChange={(e) =>
                              handleRegisterChange(
                                conf.id,
                                "presentation_time",
                                e.target.value
                              )
                            }
                            className="conf-register-input"
                            title="Presentation date and time"
                            required={
                              registerForms[
                                conf.id
                              ]?.role ===
                                "Presenter" ||
                              registerForms[
                                conf.id
                              ]?.role ===
                                "Keynote Speaker"
                            }
                          />


                          <button
                            type="submit"
                            className="conf-register-btn"
                          >

                            <Users size={14} />

                            Register

                          </button>

                        </form>

                      </div>

                    </article>

                  );

                }
              )}

            </div>

          )}

        </section>

      </main>

    </AppShell>
  );
}