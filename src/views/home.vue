<!-- This is the home view - which shows a dashboard -->
<template>
  <main>
    <div>
      <h1
        class="font-bold text-4xl text-red-700 tracking-widest text-center mt-10"
      >
        Dashboard
      </h1>

      <!-- Initiate the Piechart -->
      <div v-if="zips.length" class="flex justify-center mt-10">
        <PieChart
          v-if="!zipLoading && !zipError"
          :label="zipLabels"
          :chart-data="zipChartData"
        ></PieChart>

        <!-- Start of loading animation -->
        <div class="mt-40" v-if="zipLoading">
          <p class="text-6xl font-bold text-center text-gray-500 animate-pulse">
            Loading...
          </p>
        </div>
        <!-- End of loading animation -->

        <!-- Start of error alert -->
        <div class="mt-12 bg-red-50" v-if="zipError">
          <h3 class="px-4 py-1 text-4xl font-bold text-white bg-red-800">
            {{ zipError.title }}
          </h3>
          <p class="p-4 text-lg font-bold text-red-900">
            {{ zipError.message }}
          </p>
        </div>
        <!-- End of error alert -->
      </div>

      <br />
      <div
        class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10"
      >
        <div class="ml-10"></div>
        <div class="flex flex-col col-span-2">
          <h1
            class="font-bold text-4xl text-red-700 tracking-widest text-center mt-10"
          >
            Events Attendance
          </h1>

          <div v-if="!recentEvents.length" class="flex justify-center mt-10">
            No events found.
          </div>
          <table
            v-if="recentEvents.length"
            class="min-w-full shadow-md rounded"
          >
            <thead class="bg-gray-50 text-xl">
              <tr class="p-4 text-left">
                <th class="p-4 text-left">Event Name</th>
                <th class="p-4 text-left">Event Date</th>
                <th class="p-4 text-left">Number of Attendees</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-300">
              <tr
                @click="editEvent(event._id)"
                v-for="event in recentEvents"
                :key="event._id"
              >
                <td class="p-2 text-left">{{ event.name }}</td>
                <td class="p-2 text-left">{{ formatDate(event.date) }}</td>
                <td class="p-2 text-left">{{ event.attendees.length }}</td>
              </tr>
            </tbody>
          </table>

          <div v-if="recentEvents.length">
            <AttendanceChart
              v-if="!loading && !error"
              :label="labels"
              :chart-data="chartData"
            ></AttendanceChart>

            <!-- Start of loading animation -->
            <div class="mt-40" v-if="loading">
              <p
                class="text-6xl font-bold text-center text-gray-500 animate-pulse"
              >
                Loading...
              </p>
            </div>
            <!-- End of loading animation -->

            <!-- Start of error alert -->
            <div class="mt-12 bg-red-50" v-if="error">
              <h3 class="px-4 py-1 text-4xl font-bold text-white bg-red-800">
                {{ error.title }}
              </h3>
              <p class="p-4 text-lg font-bold text-red-900">
                {{ error.message }}
              </p>
            </div>
            <!-- End of error alert -->
          </div>
        </div>
      </div>
      <div
        class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10"
      >
        <div class="ml-10"></div>
        <div class="flex flex-col col-span-2">
          <h1
            class="font-bold text-4xl text-red-700 tracking-widest text-center mt-10"
          >
            Clients by Zip Code
          </h1>

          <div v-if="!zips.length" class="flex justify-center mt-10">
            No clients found.
          </div>
          <table v-if="zips.length" class="min-w-full shadow-md rounded">
            <thead class="bg-gray-50 text-xl">
              <tr class="p-4 text-left">
                <th class="p-4 text-left">Zip Number</th>
                <th class="p-4 text-left">Client Count</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-300">
              <tr v-for="zip in zips" :key="zip._id">
                <td class="p-2 text-left">{{ zip._id }}</td>
                <td class="p-2 text-left">{{ zip.count }}</td>
              </tr>
            </tbody>
          </table>
          <div v-if="zips.length" class="flex justify-center mt-10">
            <ZipChart
              v-if="!zipLoading && !zipError"
              :label="zipLabels"
              :chart-data="zipChartData"
            ></ZipChart>

            <!-- Start of loading animation -->
            <div class="mt-40" v-if="zipLoading">
              <p
                class="text-6xl font-bold text-center text-gray-500 animate-pulse"
              >
                Loading...
              </p>
            </div>
            <!-- End of loading animation -->

            <!-- Start of error alert -->
            <div class="mt-12 bg-red-50" v-if="zipError">
              <h3 class="px-4 py-1 text-4xl font-bold text-white bg-red-800">
                {{ zipError.title }}
              </h3>
              <p class="p-4 text-lg font-bold text-red-900">
                {{ zipError.message }}
              </p>
            </div>
            <!-- End of error alert -->
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script>
import { ref, onMounted } from 'vue';
import AttendanceChart from '../components/barChart.vue';
import ZipChart from '../components/donutZipChart.vue';
import PieChart from '../components/pieChart.vue';
import { getAttendance, getClientsByZipCode } from '../api/api';

export default {
  components: {
    AttendanceChart,
    ZipChart,
    PieChart
  },
  setup() {
    // Define reactive variables
    const recentEvents = ref([]);
    const zips = ref([]);
    const labels = ref([]);
    const chartData = ref([]);
    const zipLabels = ref([]);
    const zipChartData = ref([]);
    const loading = ref(false);
    const error = ref(null);
    const zipLoading = ref(false);
    const zipError = ref(null);

    // Function to format the event date
    const formatDate = (date) => {
      const isoDate = new Date(date);
      const year = isoDate.getUTCFullYear();
      const month = String(isoDate.getUTCMonth() + 1).padStart(2, '0');
      const day = String(isoDate.getUTCDate()).padStart(2, '0');
      return `${month}/${day}/${year}`;
    };

    // Fetch data when the component is mounted
    onMounted(async () => {
      getAttendanceData();
      fetchData();
    });

    // Function to fetch attendance data
    const getAttendanceData = async () => {
      try {
        error.value = null;
        loading.value = true;

        const attendance = await getAttendance();
        recentEvents.value = attendance;
        labels.value = attendance.map(
          (item) => `${item.name} (${formatDate(item.date)})`
        );
        chartData.value = attendance.map((item) => item.attendees.length);
      } catch (err) {
        handleErrors(err, error);
      }
      loading.value = false;
    };

    // Function to fetch zip data
    const fetchData = async () => {
      try {
        zipError.value = null;
        zipLoading.value = true;

        const zipdata = await getClientsByZipCode();
        zips.value = zipdata;
        zipLabels.value = zipdata.map((item) => item._id);
        zipChartData.value = zipdata.map((item) => item.count);
      } catch (err) {
        handleErrors(err, zipError);
      }
      zipLoading.value = false;
    };

    // Function to handle errors
    const handleErrors = (err, errorType) => {
      if (err.response) {
        errorType.value = {
          title: 'Server Response',
          message: err.message
        };
      } else if (err.request) {
        errorType.value = {
          title: 'Unable to Reach Server',
          message: err.message
        };
      } else {
        errorType.value = {
          title: 'Application Error',
          message: err.message
        };
      }
    };

    // Return reactive variables and functions
    return {
      recentEvents,
      zips,
      labels,
      chartData,
      zipLabels,
      zipChartData,
      loading,
      error,
      zipLoading,
      zipError,
      formatDate // Expose formatDate function to the template
    };
  }
};
</script>
